# Scaling Strategy

## Overview

TeamHub is designed as a real-time collaborative workspace where users can work together through shared documents, live cursors and awareness, workspace presence, chat, notifications, comments, and document version history.

The V1 architecture prioritizes:

- Correct real-time collaboration.
- Clear separation between durable and ephemeral state.
- Simple deployment and operational complexity.
- Strong authorization boundaries.
- Efficient communication through WebSockets.
- A practical architecture suitable for a portfolio-scale deployed application.

It is not designed to prematurely solve distributed systems problems that do not yet exist.

However, several parts of TeamHub are intentionally structured so they can evolve when traffic, concurrency, document size, or deployment topology increases.

The main scaling boundaries are:

```text
┌──────────────────────────────────────────────────────────┐
│                       TeamHub V1                         │
│                                                          │
│  React Client                                            │
│      │                                                   │
│      ├──── HTTP ───────► Express API                     │
│      │                      │                            │
│      │                      ├────► PostgreSQL            │
│      │                      │                            │
│      │                      └────► Upstash Redis         │
│      │                                                   │
│      └──── WebSocket ───► Socket.IO                      │
│                              │                           │
│                              ├────► Workspace Presence   │
│                              ├────► Collaborative Docs   │
│                              ├────► Chat                 │
│                              └────► Notifications        │
└──────────────────────────────────────────────────────────┘
```

The key principle is simple:

> Scale each subsystem according to the kind of state it owns rather than treating the entire application as one scaling problem.

---

## Current V1 Scaling Model

At V1 scale, TeamHub can operate using:

```text
Frontend
    React application

Backend
    Node.js + Express
    Socket.IO server

Primary database
    PostgreSQL

ORM
    Prisma

Distributed infrastructure
    Upstash Redis
    Upstash Rate Limit

Real-time collaboration
    Yjs
    Tiptap
    Socket.IO

Client server-state management
    TanStack Query
```

The application uses different mechanisms for different types of state:

| State | V1 Storage |
|---|---|
| Users | PostgreSQL |
| Authentication sessions | PostgreSQL |
| Workspaces | PostgreSQL |
| Memberships | PostgreSQL |
| Documents | PostgreSQL |
| Document content | PostgreSQL JSON |
| Chat messages | PostgreSQL |
| Comments | PostgreSQL |
| Document versions | PostgreSQL |
| Notification records | PostgreSQL |
| Notification delivery state | PostgreSQL / Redis depending on lifecycle |
| Active Y.Doc instances | Server memory |
| Document awareness | Server memory |
| Workspace presence | Server memory |
| Active socket connections | Socket.IO process memory |
| Rate-limit counters | Upstash Redis |

This separation matters because durable data, temporary collaboration state, and distributed coordination have fundamentally different scaling requirements.

---

## 1. Horizontal Scaling of the Backend

### Current limitation

A single Node.js process can manage:

```text
Client A ──┐
Client B ──┼────► Backend Instance A
Client C ──┘
```

All connected clients share the same process memory.

This works naturally for:

- Socket.IO rooms.
- Workspace presence.
- Active Y.Doc instances.
- Awareness state.
- Active collaborator tracking.

The problem appears when multiple backend instances are introduced:

```text
Client A ─────► Instance A

Client B ─────► Instance B
```

If both clients are editing the same document, Instance A and Instance B do not automatically share:

- Socket.IO room state.
- Yjs updates.
- Awareness state.
- Workspace presence.
- Active document state.

Each process has independent memory.

Therefore:

```text
Instance A memory ≠ Instance B memory
```

Simply adding more backend instances behind a load balancer would break the assumption that every collaborator of a document shares the same in-memory state.

### Scaling direction

Horizontal scaling requires separating two concerns:

```text
1. Cross-instance event distribution
2. Shared or coordinated collaborative document state
```

For Socket.IO events, a Redis-backed adapter can distribute events across backend instances:

```text
                    ┌──────────────┐
Client A ─────────► │ Instance A   │
                    └──────┬───────┘
                           │
                        Redis
                           │
                    ┌──────▼───────┐
Client B ─────────► │ Instance B   │
                    └──────────────┘
```

This allows an event emitted from Instance A to reach sockets connected to Instance B.

However, a Socket.IO Redis adapter alone does **not** solve Yjs document ownership. The backend must still ensure that collaborative updates for the same document operate against coordinated document state.

Possible future strategies include:

- Sticky routing by document ID.
- Dedicated collaboration workers.
- Shared Yjs persistence.
- Redis Streams or another event log for update distribution.
- A specialized collaboration server such as Hocuspocus.
- Partitioning documents across collaboration nodes.

The correct choice should be based on actual scale rather than implemented prematurely in V1.

---

## 2. Collaborative Document Scaling

Real-time document collaboration is one of TeamHub's most stateful subsystems.

The V1 lifecycle is approximately:

```text
First collaborator joins
          │
          ▼
Load document JSON from PostgreSQL
          │
          ▼
Convert persisted content into Y.Doc
          │
          ▼
Store active Y.Doc in server memory
          │
          ▼
┌──────────────────────────────┐
│ Multiple collaborators       │
│                              │
│ User A ─┐                    │
│ User B ─┼──► Shared Y.Doc    │
│ User C ─┘                    │
└──────────────┬───────────────┘
               │
               ▼
Last collaborator leaves
               │
               ▼
Convert Y.Doc to JSON
               │
               ▼
Persist to PostgreSQL
               │
               ▼
Destroy in-memory document
```

This avoids writing to PostgreSQL on every keystroke.

### Why this works well initially

If ten users type simultaneously, the database does not receive ten writes for every typing interval.

Instead:

```text
Typing
   │
   ▼
Yjs update
   │
   ▼
In-memory Y.Doc
   │
   ▼
Broadcast update to collaborators
```

PostgreSQL remains responsible for durable document state rather than becoming the transport layer for live editing.

### Current scaling boundaries

The V1 model has several natural limitations:

#### Memory usage

Every active document consumes server memory.

```text
10 active documents
    → small footprint

1,000 active documents
    → significantly larger footprint

Large documents × many active documents
    → increasing memory pressure
```

#### Process termination

If a server process crashes before the final persistence step, recent in-memory updates may not have been written to PostgreSQL.

#### Single-instance ownership

If two backend instances independently create a Y.Doc for the same document, their state can diverge.

```text
Document 123

Instance A
    └── Y.Doc A

Instance B
    └── Y.Doc B

Y.Doc A ≠ Y.Doc B
```

This must be prevented in a horizontally scaled architecture.

---

## 3. Improving Document Durability

The V1 persistence strategy writes the final document state when the active room closes.

This keeps implementation complexity low, but production-scale durability should not depend exclusively on the final collaborator leaving successfully.

A stronger strategy would introduce periodic or debounced persistence:

```text
Yjs updates arrive
      │
      ▼
Active Y.Doc changes
      │
      ├────────► Broadcast immediately
      │
      ▼
Mark document dirty
      │
      ▼
Debounced persistence interval
      │
      ▼
Serialize current document state
      │
      ▼
Persist durable snapshot
```

For example:

```text
Continuous typing
    → No database write per keystroke

Document becomes dirty
    → Schedule persistence

Additional updates arrive
    → Reset or batch persistence window

After interval
    → Persist latest snapshot
```

This provides a better balance between:

- Write frequency.
- Database load.
- Data durability.
- Implementation complexity.

At larger scale, another approach is storing incremental Yjs updates rather than repeatedly serializing the entire document.

```text
Initial Snapshot
      +
Update 1
      +
Update 2
      +
Update 3
      =
Current Document State
```

Periodic compaction can then merge accumulated updates into a fresh snapshot.

This becomes valuable for large documents or high-frequency editing sessions.

---

## 4. Yjs Synchronization Efficiency

A simple initial synchronization approach sends the complete document state when a collaborator joins:

```text
New user joins
      │
      ▼
Server encodes complete Y.Doc
      │
      ▼
Full state sent to client
```

This is acceptable for smaller documents.

As document size grows, sending the entire state on every join becomes increasingly expensive.

Yjs provides state-vector-based synchronization:

```text
Client State Vector
        │
        ▼
Server compares known state
        │
        ▼
Encode only missing updates
        │
        ▼
Send differential update
```

Conceptually:

```text
Client already has:
    Updates A + B + C

Server has:
    Updates A + B + C + D + E

Server sends:
    D + E
```

Instead of:

```text
A + B + C + D + E
```

This reduces:

- Network payload size.
- Join synchronization time.
- Reconnection cost.

The regular real-time update pipeline does not need to be replaced by this mechanism. State vectors primarily improve initial synchronization and reconnection.

---

## 5. Awareness and Collaboration Carets

Yjs awareness contains ephemeral collaboration information such as:

```text
User identity
User color
Cursor position
Selection
Typing state
```

Awareness is intentionally not persisted.

A cursor position from several minutes ago has no durable meaning.

The lifecycle is:

```text
User joins document
       │
       ▼
Publish local awareness state
       │
       ▼
Server tracks active awareness
       │
       ▼
Broadcast to collaborators
       │
       ▼
User leaves or disconnects
       │
       ▼
Remove awareness client
       │
       ▼
Broadcast removal
```

The awareness client ID must remain distinct from:

- User ID.
- Socket ID.

These identifiers represent different concepts:

```text
User ID
    → persistent authenticated identity

Socket ID
    → one network connection

Awareness client ID
    → one Yjs awareness participant
```

A user can refresh the page and retain the same user ID while receiving:

```text
New Socket ID
New Yjs client ID
New Awareness client ID
```

Correct cleanup is therefore essential to prevent stale collaborators from accumulating.

At larger scale, awareness should remain ephemeral but may require cross-instance propagation through a distributed pub/sub mechanism.

---

## 6. Workspace Presence Scaling

Workspace presence answers questions such as:

```text
Who is currently online?

Who is away?

Which part of the workspace is a user viewing?
```

In V1, presence can be maintained through active Socket.IO connections:

```text
Workspace
    │
    ├── Socket A → User A → online
    ├── Socket B → User B → online
    └── Socket C → User C → away
```

The server tracks connections by socket ID because one user may have multiple tabs or devices.

```text
User A
├── Browser Tab 1 → Socket A
├── Browser Tab 2 → Socket B
└── Laptop         → Socket C
```

Presence should not incorrectly mark the user offline until all relevant active connections have disappeared.

### Single-instance limitation

In-memory presence works correctly while all connections live inside one server process.

With multiple instances:

```text
Instance A knows:
    User A
    User B

Instance B knows:
    User C
    User D
```

Neither instance has the complete presence picture.

A distributed presence model could use Redis:

```text
presence:workspace:{workspaceId}
```

with connection entries and TTL-based expiration.

Conceptually:

```text
Socket connects
    → Register presence

Heartbeat / activity
    → Refresh TTL

Socket disconnects normally
    → Remove connection

Unexpected connection loss
    → TTL eventually expires
```

This avoids permanently stale presence when graceful disconnect events are missed.

---

## 7. Away Status and Activity-Aware Presence

A richer presence system can move beyond only:

```text
online
offline
```

to:

```text
online
away
offline
```

The browser can track user activity through events such as:

```text
mousemove
keydown
click
visibilitychange
```

A possible lifecycle:

```text
User actively interacts
        │
        ▼
      ONLINE
        │
        │ inactivity threshold
        ▼
       AWAY
        │
        │ activity resumes
        ▼
      ONLINE
```

Presence can also carry lightweight activity metadata:

```json
{
  "status": "online",
  "activity": {
    "type": "document",
    "documentId": "doc_123"
  }
}
```

This can support UI such as:

```text
Aadi
Online · Editing API Design

Alex
Online · Viewing Documents

Sam
Away
```

Activity should remain lightweight and ephemeral. It should not become a permanent activity log.

---

## 8. Socket.IO Room Strategy

TeamHub uses logical rooms to scope real-time communication.

Examples:

```text
workspace:{workspaceId}

document:{documentId}

user:{userId}
```

Each room serves a different purpose.

### Workspace rooms

Used for:

- Presence.
- Workspace-level activity.
- Chat.
- Workspace-wide events.

### Document rooms

Used for:

- Yjs updates.
- Awareness.
- Collaboration carets.
- Document-specific events.

### User rooms

Useful for:

- Personal notifications.
- Direct delivery.
- Multi-tab synchronization for one user.

Room scoping prevents unnecessary broadcasting.

Instead of:

```text
Broadcast event to every connected socket
```

TeamHub can use:

```text
io.to(`workspace:${workspaceId}`).emit(...)
```

or:

```text
socket.to(`document:${documentId}`).emit(...)
```

This reduces network traffic and ensures events only reach relevant clients.

---

## 9. Chat Scaling

Workspace chat introduces durable messages combined with real-time delivery.

The correct flow is:

```text
Client sends message
       │
       ▼
Authenticate socket
       │
       ▼
Authorize workspace membership
       │
       ▼
Validate payload
       │
       ▼
Persist message to PostgreSQL
       │
       ▼
Broadcast committed message
       │
       ▼
Connected clients update UI
```

The database should remain the source of truth.

A message should not be treated as successfully created merely because it was broadcast over a WebSocket.

```text
Persist first
Broadcast second
```

This prevents clients from displaying messages that were never durably stored.

### Pagination

Chat history should not load every message at once.

Prefer cursor-based pagination:

```text
Latest 30 messages
        │
        ▼
User scrolls upward
        │
        ▼
Fetch 30 older messages
        │
        ▼
Continue as needed
```

Cursor pagination is more suitable than increasingly large offsets for continuously growing message collections.

---

## 10. Notification Scaling

Notifications combine durable records with real-time delivery.

A notification can follow this lifecycle:

```text
Domain event occurs
       │
       ▼
Create notification record
       │
       ▼
Check whether recipient is connected
       │
       ├── Yes ──► Deliver through Socket.IO
       │
       └── No  ──► Keep unread in PostgreSQL
```

The database remains responsible for:

```text
Notification history
Read/unread state
Created timestamp
Recipient relationship
```

WebSockets provide immediate delivery but should not become the source of truth.

### Event-driven notification creation

Instead of tightly coupling every feature to notification implementation:

```text
Document service
    → directly creates notification

Comment service
    → directly creates notification

Chat service
    → directly creates notification
```

TeamHub can use domain events:

```text
CommentCreated
MemberJoined
UserMentioned
DocumentShared
```

Consumers can then independently handle:

```text
Notification creation
Activity feed creation
Analytics
External integrations
```

Conceptually:

```text
Domain Action
     │
     ▼
  Event Bus
     │
     ├──► Notification Handler
     ├──► Activity Handler
     └──► Analytics Handler
```

For V1, this can remain an in-process event system.

At larger scale, durable queues or streams can replace in-process delivery where reliability requires it.

---

## 11. Upstash Redis

TeamHub uses Upstash Redis for distributed infrastructure needs where relational persistence is not the correct fit.

Suitable responsibilities include:

```text
Rate limiting
Distributed counters
Short-lived cached data
Notification coordination
Presence coordination at scale
Pub/sub or stream-based event distribution
```

Redis should not become a duplicate primary database.

A useful rule is:

```text
If the data must survive indefinitely
    → PostgreSQL

If the data is temporary, distributed, fast-changing,
or coordination-oriented
    → Redis may be appropriate
```

### Why Upstash for V1

Upstash provides a serverless Redis model that is practical for a deployed portfolio application because it avoids maintaining a dedicated Redis process.

It also provides a separate rate-limiting SDK suitable for distributed deployments.

This means rate limits remain shared even when requests reach different backend instances.

---

## 12. Distributed Rate Limiting

An in-memory rate limiter works only within one backend process:

```text
Instance A count: 8 requests

Instance B count: 7 requests

Actual total: 15 requests
```

Neither instance knows the complete request count.

A Redis-backed limiter provides a shared counter:

```text
Instance A ──┐
             ├────► Shared Redis counter
Instance B ──┘
```

Potential rate-limit targets include:

- Authentication attempts.
- Workspace creation.
- Invite-code attempts.
- Document creation.
- Chat messages.
- AI requests.
- Search requests.
- Expensive API operations.

Different operations should have different limits.

For example:

```text
Login attempts
    → strict

Normal document reads
    → generous

AI generation
    → heavily controlled

Search
    → moderate

WebSocket events
    → event-specific protection
```

A single global limit for every action would be too coarse.

---

## 13. PostgreSQL Scaling

PostgreSQL is the durable source of truth for TeamHub.

The first scaling improvements should not be database sharding.

They should be:

```text
Correct indexes
Pagination
Query selection
Connection management
Avoiding N+1 queries
Caching only where justified
Query-plan analysis
```

### Indexing

Indexes should follow real query patterns.

Examples include:

```text
workspaceId
userId
createdById
recipientId + createdAt
workspaceId + createdAt
documentId + createdAt
```

Composite indexes become useful when filtering and ordering occur together.

For example:

```sql
WHERE workspace_id = ?
ORDER BY created_at DESC
```

may benefit from a corresponding composite index when the table grows.

Indexes should not be added indiscriminately because every additional index increases storage and write cost.

---

## 14. Pagination Strategy

Any collection that can grow indefinitely should be paginated.

This includes:

```text
Documents
Chat messages
Notifications
Activity events
Comments
Document versions
Search results
```

For stable or continuously changing timelines, cursor pagination is generally preferred.

```text
First request:
    latest 30 items

Response:
    items
    nextCursor

Next request:
    cursor = nextCursor
```

Advantages include:

- Stable traversal during concurrent inserts.
- No increasingly expensive large offsets.
- Better fit for infinite scrolling.

Offset pagination can remain acceptable for smaller administrative datasets where random page navigation matters more than continuous feeds.

---

## 15. Avoiding N+1 Queries

Consider retrieving a workspace and then separately querying each member:

```text
1 query → workspace

100 members
    → 100 additional user queries

Total:
    101 queries
```

This is an N+1 query pattern.

Prisma relations should be selected intentionally:

```text
Workspace
    └── Members
           └── User fields needed by UI
```

Only required fields should be returned.

For example, a member list may need:

```text
id
name
avatar
role
```

It does not need:

```text
password
refresh token hashes
token version
```

Efficient data selection improves:

- Query performance.
- Serialization cost.
- Network payload size.
- Security boundaries.

---

## 16. Database Connection Management

When horizontally scaling Node.js instances, every process can create its own database connection pool.

```text
5 instances
×
20 connections each
=
100 PostgreSQL connections
```

This can exhaust database connection limits before CPU or memory becomes the bottleneck.

At larger scale, connection pooling becomes important.

Potential solutions include:

- Provider-managed pooling.
- PgBouncer.
- Prisma-compatible connection pooling.
- Serverless database connection proxies where appropriate.

Backend instance count and database connection count must be considered together.

---

## 17. Caching Strategy

Caching should be introduced selectively.

Good candidates include data that is:

```text
Frequently read
Relatively expensive to compute
Shared across many requests
Not changing every second
```

Possible examples:

- Workspace metadata.
- Membership checks.
- User profile summaries.
- Frequently accessed document metadata.

Poor caching candidates include:

- Rapidly changing collaborative content.
- Awareness state.
- Cursor positions.
- Highly dynamic presence without proper invalidation.

The most important rule is:

> Do not add caching merely because Redis exists.

Every cache creates an invalidation problem.

A safe evolution is:

```text
Measure repeated expensive query
        │
        ▼
Identify cache candidate
        │
        ▼
Define TTL and invalidation behavior
        │
        ▼
Introduce cache
        │
        ▼
Measure again
```

---

## 18. Version History Scaling

Document version history should not create a full permanent snapshot on every keystroke.

Possible version triggers include:

```text
Manual named version
Meaningful editing interval
Document close
Periodic checkpoint
Before destructive operation
```

A simple V1 model can store serialized document snapshots.

As document size and version count increase, full snapshots become expensive:

```text
100 KB document
×
1,000 versions
=
approximately 100 MB before database overhead
```

Future optimization strategies include:

- Snapshot retention policies.
- Periodic full snapshots plus incremental updates.
- Compression.
- Archival of old versions.
- User-defined important versions.

The simplest implementation should be preferred until actual data volume justifies a more complex model.

---

## 19. Search Scaling

A basic search system can initially query PostgreSQL for:

```text
Workspace names
Document titles
Member names
File names
```

As data grows, possible improvements include:

```text
PostgreSQL full-text search
Trigram indexes
Dedicated search service
Asynchronous indexing
```

A dedicated external search engine should not be introduced until PostgreSQL search is measurably insufficient.

For most portfolio and early product workloads:

```text
PostgreSQL + correct indexes
```

is usually enough.

---

## 20. AI Request Scaling

AI operations differ from normal API requests because they are:

- Expensive.
- Higher latency.
- Dependent on external providers.
- Subject to quotas and token limits.

AI requests should therefore have dedicated protections:

```text
Authentication
      │
      ▼
Authorization
      │
      ▼
Rate limit
      │
      ▼
Input validation
      │
      ▼
Context size control
      │
      ▼
AI provider request
```

Potential improvements include:

- Per-user quotas.
- Per-workspace quotas.
- Request deduplication.
- Response caching where semantically safe.
- Background jobs for expensive operations.
- Streaming responses.
- Timeout and retry policies.

AI traffic should not share exactly the same rate-limit policy as ordinary CRUD requests.

---

## 21. Background Jobs

Some work should not block an HTTP request or WebSocket callback.

Examples include:

```text
Sending email
Generating large AI summaries
Processing files
Cleaning expired sessions
Notification fan-out
Search indexing
Analytics aggregation
Old version cleanup
```

The request path should ideally remain:

```text
Request
    │
    ▼
Validate
    │
    ▼
Persist core state
    │
    ▼
Queue background work
    │
    ▼
Respond
```

rather than:

```text
Request
    │
    ▼
Perform every secondary operation
    │
    ▼
Wait
    │
    ▼
Wait more
    │
    ▼
Respond
```

V1 does not require introducing a full distributed queue for every operation. Background infrastructure should be added when the feature actually requires retryability, durability, or asynchronous processing.

---

## 22. WebSocket Event Reliability

Socket.IO provides real-time communication, but not every event requires the same reliability guarantee.

### Ephemeral events

Examples:

```text
Cursor movement
Typing indicator
Presence update
Selection movement
```

If one update is lost, the next update usually replaces it.

These events should prioritize low latency over durable delivery.

### Durable events

Examples:

```text
Chat message created
Comment created
Notification created
Document version created
```

These should first be persisted.

```text
Client event
      │
      ▼
Validate
      │
      ▼
Persist
      │
      ▼
Broadcast committed result
```

This distinction prevents the real-time transport from becoming the source of truth for durable application data.

---

## 23. Backpressure and High-Frequency Events

Some real-time events can occur very frequently:

```text
Typing
Cursor movement
Selection changes
Presence activity
Document updates
```

Sending every browser event without control can generate unnecessary traffic.

Depending on the event, TeamHub can use:

- Throttling.
- Debouncing.
- Batching.
- Yjs's native incremental update model.
- Last-value-wins semantics.

For example:

```text
Mouse movement:
    100 browser events / second

Network transmission:
    perhaps 10–20 meaningful updates / second
```

The exact frequency should be chosen based on user experience rather than arbitrary optimization.

Document updates should be handled carefully because aggressive debouncing can negatively affect collaboration responsiveness.

---

## 24. Multi-Tab and Multi-Device Users

A single authenticated user may have several simultaneous connections:

```text
User A
├── Chrome Tab 1
├── Chrome Tab 2
├── Mobile Browser
└── Another Device
```

Therefore:

```text
User ID ≠ Socket ID
```

Presence should be connection-aware.

A user should not become globally offline merely because one tab closes while another remains connected.

Similarly:

```text
User ID
Socket ID
Yjs client ID
Awareness client ID
```

should remain conceptually separate.

Each identifier solves a different lifecycle problem.

---

## 25. Disconnect and Cleanup Strategy

Normal navigation and actual network disconnection are different events.

### Navigating away from a workspace

The browser remains connected to the global socket.

Therefore:

```text
workspace:leave
```

explicitly removes the socket from workspace presence.

### Closing or refreshing the browser

The socket connection terminates.

Therefore:

```text
disconnecting
```

acts as the final cleanup path across all joined rooms.

A global disconnect handler can inspect room prefixes:

```text
workspace:{workspaceId}
document:{documentId}
```

and perform subsystem-specific cleanup.

Conceptually:

```text
Socket disconnecting
       │
       ▼
Snapshot current rooms
       │
       ├── workspace:* 
       │       └── Remove presence connection
       │
       └── document:*
               ├── Remove awareness participant
               └── Remove active document user
```

Explicit leave events and disconnect cleanup are not duplicates in purpose:

```text
Explicit leave
    → application navigation lifecycle

Disconnecting
    → connection lifecycle fallback
```

Both are required because client-side navigation does not necessarily terminate the WebSocket connection.

---

## 26. Failure Modes

A scalable system should consider not only traffic but also failure.

### Backend crashes during active editing

Potential impact:

```text
Recent unpersisted Y.Doc changes may be lost
```

Mitigation:

```text
Periodic persistence
Incremental update storage
External collaboration persistence
```

### Client disconnects without explicit leave

Potential impact:

```text
Stale presence
Stale awareness
Incorrect active-user counts
```

Mitigation:

```text
disconnecting cleanup
Redis TTLs at multi-instance scale
Awareness removal broadcasts
```

### Redis temporarily unavailable

The application should distinguish critical and non-critical Redis responsibilities.

For example:

```text
PostgreSQL unavailable
    → Core durable operations fail

Redis unavailable
    → Some rate limits, caching, presence coordination,
      or notification optimizations may degrade
```

The exact failure behavior depends on what Redis is responsible for.

### Duplicate socket events

Reconnects and retries can sometimes result in repeated client operations.

Durable event handlers should be designed with idempotency in mind where duplicate execution could cause incorrect state.

---

## 27. Observability

Scaling decisions should be based on measurements.

Useful metrics include:

```text
HTTP request latency
WebSocket connection count
Active workspaces
Active documents
Concurrent editors per document
Yjs update rate
Document persistence duration
Database query latency
Database connection usage
Redis latency
Notification delivery rate
Chat message throughput
Memory usage per backend instance
Event-loop lag
Error rate
```

Without observability, scaling decisions become guesses.

The progression should be:

```text
Observe
    ↓
Measure
    ↓
Identify bottleneck
    ↓
Optimize
    ↓
Measure again
```

---

## 28. Deployment Evolution

A possible deployment evolution for TeamHub is:

### Stage 1 — V1

```text
Frontend
    │
    ▼
Single Node.js backend
    │
    ├── PostgreSQL
    └── Upstash Redis
```

Suitable for:

- Portfolio deployment.
- Moderate traffic.
- Demonstrating the complete product.
- Testing real-world collaboration.

### Stage 2 — Increased traffic

```text
                  Load Balancer
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Backend A           Backend B
             │                   │
             └─────────┬─────────┘
                       │
                 Shared Redis
                       │
                 PostgreSQL
```

Requires:

- Cross-instance Socket.IO coordination.
- Shared rate limits.
- Correct presence coordination.
- Database connection management.

### Stage 3 — Collaboration-specific scaling

```text
                API Servers
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     CRUD / Auth          Collaboration Layer
                                  │
                          Document partitioning
                                  │
                        Durable Yjs persistence
```

At this point, collaborative editing can be separated from ordinary HTTP application traffic.

### Stage 4 — Specialized asynchronous infrastructure

```text
Domain Events
      │
      ▼
Queue / Stream
      │
      ├── Notifications
      ├── Activity Feed
      ├── Search Indexing
      ├── Analytics
      └── AI Processing
```

This should only be introduced when operational requirements justify the added complexity.

---

## 29. What TeamHub Should Not Prematurely Add

Scalability does not mean maximizing the number of infrastructure technologies.

TeamHub should not add these without a demonstrated requirement:

- Kubernetes.
- Microservices.
- Kafka.
- Database sharding.
- Multiple Redis clusters.
- Separate databases per service.
- Complex CQRS infrastructure.
- Distributed queues for trivial synchronous operations.
- Dedicated search infrastructure for small datasets.

Every new distributed component adds:

```text
Deployment complexity
Failure modes
Monitoring requirements
Debugging difficulty
Data consistency problems
Operational cost
```

A strong engineering decision is often knowing what **not** to add yet.

---

## 30. Recommended Evolution Priorities

If TeamHub grows beyond V1 scale, improvements should be introduced approximately in this order:

```text
1. Measure real bottlenecks

2. Add pagination to all unbounded collections

3. Verify indexes against real query patterns

4. Add periodic/debounced collaborative document persistence

5. Add distributed rate limiting with Upstash

6. Improve database connection management

7. Add selective caching where measurements justify it

8. Introduce cross-instance Socket.IO coordination

9. Move presence coordination beyond single-process memory

10. Solve distributed Yjs document ownership

11. Add background processing for expensive asynchronous work

12. Separate collaboration infrastructure only when scale requires it
```

This order deliberately prioritizes simple, high-impact improvements before introducing distributed complexity.

---

## Summary

TeamHub's scaling strategy is based on separating different categories of state and evolving each subsystem independently.

```text
Durable relational state
    → PostgreSQL

Temporary distributed state
    → Upstash Redis where required

Live client communication
    → Socket.IO

Collaborative document state
    → Yjs

Client-side server state
    → TanStack Query

High-frequency ephemeral events
    → Real-time transport without unnecessary persistence

Durable events
    → Persist first, then broadcast
```

The V1 architecture intentionally avoids premature infrastructure complexity while establishing clear boundaries for future growth.

The most important future scaling challenges are not generic HTTP traffic. They are the stateful parts of the system:

- Coordinating Yjs documents across multiple backend instances.
- Improving collaborative document durability.
- Synchronizing Socket.IO events across instances.
- Maintaining accurate distributed workspace presence.
- Scaling chat, notifications, comments, activity, and version history without loading unbounded datasets.
- Protecting expensive operations through distributed rate limiting.
- Managing database connections and queries as backend instances increase.

The intended evolution is therefore:

```text
Single-instance simplicity
        │
        ▼
Measured optimization
        │
        ▼
Distributed coordination where required
        │
        ▼
Specialized infrastructure only when justified
```

The goal is not to build the most complicated architecture possible.

The goal is to preserve correctness, collaboration quality, durability, and maintainability as TeamHub grows.