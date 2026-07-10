# TeamHub Architecture

## Overview

TeamHub is a full-stack collaborative engineering workspace built around persistent workspaces, real-time document collaboration, and live member presence.

The current architecture separates four fundamentally different kinds of application state:

- **Persistent application state** — users, workspaces, memberships, documents, and other durable relational data stored in PostgreSQL.
- **Frontend server state** — API-backed data cached and synchronized through TanStack Query.
- **Collaborative document state** — CRDT-based shared document content managed by Yjs.
- **Ephemeral real-time state** — document awareness and workspace presence maintained during active sessions.

This separation is intentional. A workspace member being online, a collaborator moving their cursor, a document receiving concurrent edits, and a workspace record being fetched from PostgreSQL all have different consistency requirements and lifecycles. TeamHub does not force them through a single state-management or transport mechanism.

```text
┌──────────────────────────────────────────────────────────────────────┐
│                           React Client                               │
│                                                                      │
│   React Router     TanStack Query     Socket.IO Client     Y.Doc     │
│        │                  │                   │               │       │
└────────┼──────────────────┼───────────────────┼───────────────┼───────┘
         │                  │                   │               │
         │                  │ REST / HTTP       │ WebSocket     │
         │                  ▼                   ▼               │
         │       ┌──────────────────────────────────────────┐   │
         │       │       Express + TypeScript Server        │   │
         │       │                                          │   │
         │       │   HTTP Modules       Socket Handlers     │   │
         │       │        │                    │             │   │
         │       │        ▼                    ▼             │   │
         │       │    Services         Real-Time Services   │   │
         │       └────────┬────────────────────┬─────────────┘   │
         │                │                    │                 │
         │                ▼                    ▼                 │
         │        PostgreSQL + Prisma     Active Y.Doc ◄─────────┘
         │                                     │
         │                                     ├── Awareness
         │                                     └── Active connections
         │
         └── Client-side routing and workspace composition
```

---

## Architectural Principles

TeamHub's current architecture follows several concrete principles derived from the behavior of the product.

### 1. The workspace is the primary isolation boundary

Documents and members exist within workspace context. Protected operations validate that the authenticated user belongs to the workspace before allowing access to workspace resources.

For document operations, the server additionally verifies that the requested document belongs to the specified workspace.

```text
Authenticated User
        │
        ▼
Workspace Membership?
        │
        ▼
Resource Belongs to Workspace?
        │
        ▼
Operation Allowed
```

This prevents a client from gaining access to a resource merely by knowing its identifier.

### 2. Persistent and ephemeral state are separate

PostgreSQL is used for durable application data. It is not used as a transport mechanism for cursor movement, presence changes, or every incremental collaborative edit.

Similarly, in-memory presence and awareness state are not treated as durable records.

```text
Persistent State                    Ephemeral State
────────────────                    ───────────────
Users                               Online connections
Workspaces                          Workspace presence
Memberships                         Document awareness
Documents                           Caret positions
Durable document content            Remote selections
```

### 3. REST and WebSockets have different responsibilities

REST APIs handle conventional resource-oriented operations and durable server state.

Socket.IO handles state that benefits from immediate bidirectional synchronization, including:

- Collaborative Yjs document updates.
- Document awareness.
- Workspace presence.
- Connection lifecycle events.

The WebSocket layer is not used as a replacement for every API operation.

### 4. Real-time transport does not perform conflict resolution

Socket.IO transports collaborative updates, but it does not determine how concurrent edits should merge.

Yjs owns collaborative document semantics and CRDT-based conflict resolution.

```text
Socket.IO = transport

Yjs = shared document model + concurrent merge semantics
```

### 5. Workspace presence and document awareness are independent

They answer different questions:

```text
Workspace Presence
        │
        └── Who is currently connected to this workspace?

Document Awareness
        │
        └── Who is actively collaborating inside this document?

Y.Doc
        │
        └── What is the current shared document content?
```

A user may be present in a workspace without actively editing a document. Therefore, these systems have separate state, events, identifiers, and cleanup lifecycles.

---

## High-Level System Architecture

```text
                              CLIENT
                                 │
         ┌───────────────────────┼────────────────────────┐
         │                       │                        │
         ▼                       ▼                        ▼
   TanStack Query          Socket.IO Client            Y.Doc
         │                       │                        │
         │                       ├── Workspace Presence   │
         │                       ├── Awareness ───────────┤
         │                       └── Yjs Updates ─────────┤
         │                                                │
         ▼                                                ▼
      REST API                                    Tiptap Editor
         │                                                │
         └───────────────────────┬────────────────────────┘
                                 ▼
                              SERVER
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       Application Data    Presence Service    Active Documents
              │                  │                  │
              ▼                  ▼                  ▼
       Prisma/PostgreSQL    In-Memory Maps     Y.Doc + Awareness
                                                    │
                                                    ▼
                                            Document Persistence
```

Each part owns a specific responsibility:

| Component | Responsibility |
|---|---|
| React | UI composition and local interface state |
| React Router | Application and workspace navigation |
| TanStack Query | API-backed server state, caching, and invalidation |
| Socket.IO | Bidirectional real-time event transport |
| Yjs | Collaborative document state and CRDT merging |
| Yjs Awareness | Ephemeral document collaborator metadata |
| Tiptap | Rich-text editing interface bound to Yjs |
| Express | HTTP API and backend application boundary |
| Prisma | Type-safe relational data access |
| PostgreSQL | Durable application persistence |
| In-memory services | Active document sessions and workspace presence |

---

# Frontend Architecture

## Feature-Oriented Organization

The frontend is organized primarily by product feature rather than by global technical categories.

```text
client/
├── public/
└── src/
    ├── assets/
    │
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── document-editor/
    │   ├── global-search/
    │   ├── landing/
    │   ├── workspace/
    │   ├── workspace-activity/
    │   ├── workspace-ai/
    │   ├── workspace-analytics/
    │   ├── workspace-chat/
    │   ├── workspace-documents/
    │   ├── workspace-files/
    │   ├── workspace-home/
    │   ├── workspace-members/
    │   ├── workspace-notifications/
    │   └── workspace-settings/
    │
    └── shared/
        ├── components/
        │   └── ui/
        ├── layouts/
        ├── lib/
        ├── providers/
        └── router/
```

Feature modules may contain their own:

```text
feature/
├── components/
├── context/
├── extensions/
├── hooks/
├── mock/
├── pages/
├── schemas/
├── services/
└── types/
```

Not every feature requires every directory. A feature owns only the layers relevant to its responsibilities.

For example, the document editor owns editor-specific components, hooks, context, extensions, pages, and types, while the landing page currently requires only its page-level presentation.

The `shared` directory contains infrastructure and UI primitives that are genuinely shared across product features, including:

- Reusable UI components.
- Application layouts.
- Shared libraries and utilities.
- Global providers.
- Router configuration.

The presence of a feature directory does not imply that the corresponding product feature is fully implemented. The structure provides module boundaries for current and future development.

---

## Frontend State Ownership

TeamHub deliberately avoids placing all state into one global store.

Different forms of state are owned by the mechanism best suited to their lifecycle:

| State Type | Owner |
|---|---|
| Persistent API-backed data | TanStack Query |
| Authentication/session state | Authentication query and backend session |
| Collaborative document content | Y.Doc |
| Remote document collaborators | Yjs Awareness |
| Workspace online presence | `useWorkspacePresence` |
| Navigation state | React Router |
| Component-specific UI state | React state |
| Shared editor context | Feature-specific React context where required |

This separation is especially important for collaborative editing.

A document's content should not be copied into ordinary React state and synchronized manually between users. Yjs remains the source of truth for collaborative document state, while React renders the surrounding interface.

---

## Frontend Service Boundary

Feature-level services isolate HTTP communication from components.

A typical frontend flow is:

```text
Page / Component
       │
       ▼
   Custom Hook
       │
       ▼
 Feature Service
       │
       ▼
     API
```

TanStack Query hooks sit above these services and manage:

- Fetching.
- Caching.
- Loading and error states.
- Query invalidation.
- Synchronization of persistent server state.

Real-time collaboration does not pass through TanStack Query when the state is inherently ephemeral or CRDT-managed.

For example:

```text
Workspace metadata       → TanStack Query
Document CRUD metadata   → TanStack Query
Collaborative text       → Y.Doc
Remote carets            → Awareness
Online workspace users   → Socket.IO presence state
```

---

## Workspace Shell Architecture

Workspace routes share a persistent workspace shell.

```text
/workspace/:workspaceId/...
```

The shell provides the surrounding workspace experience:

```text
┌───────────────────────────────────────────────────────────────┐
│                       Top Navigation                          │
├──────────────┬────────────────────────────┬───────────────────┤
│              │                            │                   │
│ Left         │                            │ Right             │
│ Workspace    │       Route Content        │ Collaboration     │
│ Navigation   │                            │ Sidebar           │
│              │                            │                   │
│              │                            │ Members / Chat    │
│              │                            │                   │
└──────────────┴────────────────────────────┴───────────────────┘
```

Workspace-level data and presence remain available as users navigate between nested workspace modules.

The right collaboration sidebar is contextual:

- Open by default on the workspace home page.
- Collapsed by default on other workspace modules.
- Manually expandable by the user.

---

# Backend Architecture

## Module-Oriented Organization

The backend is organized around product domains and shared infrastructure.

```text
server/
├── prisma/
│   └── migrations/
│
└── src/
    ├── app/
    ├── config/
    ├── events/
    ├── infrastructure/
    │   └── websocket/
    ├── lib/
    ├── middleware/
    │
    ├── modules/
    │   ├── ai/
    │   ├── auth/
    │   ├── chat/
    │   ├── documents/
    │   │   └── collaboration/
    │   ├── events/
    │   ├── files/
    │   ├── members/
    │   ├── notifications/
    │   ├── search/
    │   ├── users/
    │   ├── versions/
    │   └── workspaces/
    │       └── presence/
    │
    └── shared/
        ├── authorization/
        ├── errors/
        ├── types/
        └── utils/
```

The architecture distinguishes between:

- **Application setup** — server initialization and application composition.
- **Configuration** — environment and service configuration.
- **Infrastructure** — cross-cutting runtime infrastructure such as WebSockets.
- **Middleware** — HTTP and authentication middleware.
- **Modules** — product-domain logic.
- **Shared authorization** — reusable backend authorization boundaries.
- **Shared errors, types, and utilities** — common server concerns.

As with the frontend, a module directory does not necessarily indicate a fully implemented V1 feature.

---

## Backend Request Flow

Conventional HTTP operations generally follow this direction:

```text
HTTP Request
      │
      ▼
    Route
      │
      ▼
 Controller
      │
      ▼
   Service
      │
      ├── Authorization
      ├── Business Logic
      └── Persistence
               │
               ▼
         Prisma / PostgreSQL
```

The controller handles HTTP-specific concerns, while services own application behavior and persistence coordination.

Real-time operations follow a parallel but separate path:

```text
Socket Event
      │
      ▼
 Event Handler
      │
      ▼
 Real-Time Service
      │
      ├── Authorization
      ├── State Mutation
      ├── Yjs Processing
      └── Broadcast
```

This allows REST and WebSocket interfaces to coexist without mixing HTTP response handling into collaborative synchronization logic.

---

# Workspace Isolation and Authorization

A workspace acts as both a product boundary and an authorization boundary.

```text
                              User
                                │
               ┌────────────────┴────────────────┐
               │                                 │
               ▼                                 ▼
          Workspace A                       Workspace B
               │                                 │
      ┌────────┼────────┐              ┌─────────┼─────────┐
      ▼        ▼        ▼              ▼         ▼         ▼
   Members  Documents  Presence      Members  Documents  Presence
```

A user may belong to multiple workspaces, but access to one workspace does not imply access to another.

For protected document collaboration operations, the server verifies:

```text
Incoming Document Operation
             │
             ▼
      Socket Authenticated?
             │
             ▼
   User Belongs to Workspace?
             │
             ▼
 Document Belongs to Workspace?
             │
             ▼
      Perform Operation
```

Shared authorization helpers such as workspace membership and document ownership checks centralize these boundaries instead of duplicating raw authorization queries throughout the application.

This applies to both REST operations and Socket.IO events.

---

# Real-Time Architecture

## One Connection, Multiple Logical Rooms

The client maintains a shared Socket.IO connection.

The same connection may participate in multiple logical rooms:

```text
Authenticated Socket Connection
               │
               ├── workspace:<workspaceId>
               │
               └── document:<documentId>
```

The workspace room supports workspace-scoped real-time behavior such as presence.

The document room supports document-specific collaboration and awareness.

This avoids creating a separate physical WebSocket connection for every real-time feature.

---

## Socket Authentication

The WebSocket server applies authentication before protected real-time operations are registered and processed.

```text
Socket Connection Request
          │
          ▼
     Socket Auth
          │
     ┌────┴────┐
     │         │
  Rejected  Authenticated
               │
               ▼
      Real-Time Event Handlers
```

Authenticated user information is attached to the socket and reused by collaboration and presence services.

Even after connection authentication, protected events perform resource-level authorization where required.

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this operation on this workspace or document?

Both are required.

---

# Workspace Presence Architecture

Workspace presence tracks active user connections at workspace scope.

It is separate from document awareness because a user can be online in a workspace without currently editing a document.

## Presence State

A presence entry contains connection and user-level information conceptually similar to:

```text
ActiveWorkspace
    │
    └── users: Map<socketId, ActiveWorkspaceUser>
                         │
                         ├── socketId
                         └── presence
                              ├── user
                              │    ├── id
                              │    ├── name
                              │    ├── avatar
                              │    └── color
                              │
                              ├── status
                              └── activity
```

The active connection is keyed by `socketId`, not by database user ID.

This is important because the same user may have:

- Multiple browser tabs.
- Multiple browser windows.
- Multiple devices.
- Multiple simultaneous connections.

Using the database user ID as the connection identity would collapse distinct live connections into one entry and create incorrect cleanup behavior.

---

## Workspace Join Flow

```text
Client enters workspace
          │
          ▼
   workspace:join
          │
          ▼
Validate workspace membership
          │
          ▼
Add socket connection to presence map
          │
          ▼
Join workspace:<workspaceId> room
          │
          ▼
Return current presence list
          │
          ▼
Broadcast updated presence
```

The frontend stores the synchronized presence list and uses it to augment persistent workspace member data.

The persistent member list answers:

> Who belongs to this workspace?

The presence list answers:

> Which workspace connections are active right now?

The UI combines both.

---

## Workspace Leave and Disconnect

Normal navigation and physical socket disconnection are different lifecycle events.

### Normal navigation

When a user navigates away from a workspace while the global socket remains connected:

```text
Workspace unmount
      │
      ▼
workspace:leave
      │
      ▼
Remove socket from presence state
      │
      ▼
Leave workspace room
      │
      ▼
Broadcast updated presence
```

### Browser refresh, tab close, or connection loss

When the socket itself disconnects:

```text
Socket disconnecting
        │
        ▼
Inspect joined workspace rooms
        │
        ▼
Remove socket from each presence map
        │
        ▼
Broadcast updated presence
```

This distinction prevents stale online users while preserving one global WebSocket connection during ordinary application navigation.

---

# Collaborative Document Architecture

## Active Document Model

The server maintains active collaborative documents in memory.

Conceptually:

```text
Map<documentId, ActiveDocument>

ActiveDocument
├── ydoc: Y.Doc
├── awareness: Awareness
└── users: Set<socketId>
```

Each active document owns:

- The current server-side Yjs document.
- Its document awareness state.
- The set of active socket connections currently using the document.

The server does not create a new Y.Doc for every incoming edit. The active Y.Doc remains available for the collaborative session.

---

## Document Join Lifecycle

When the first collaborator opens a document:

```text
Client joins document
         │
         ▼
Validate workspace membership
         │
         ▼
Validate document belongs to workspace
         │
         ▼
Is Y.Doc already active?
    │                 │
   Yes                No
    │                 │
    │                 ▼
    │         Load persisted document
    │                 │
    │                 ▼
    │         Convert content to Y.Doc
    │                 │
    └─────────┬───────┘
              ▼
      Register active socket
              │
              ▼
      Encode current Y.Doc state
              │
              ▼
      Encode current awareness state
              │
              ▼
      Join document room
              │
              ▼
      Return initial synchronization state
```

If another collaborator subsequently joins, the existing active Y.Doc is reused.

---

## Collaborative Update Flow

Once initial synchronization is complete, edits are transferred as incremental Yjs updates.

```text
User A types
     │
     ▼
Tiptap Editor
     │
     ▼
Local Y.Doc
     │
     │ Incremental Yjs update
     ▼
document:update
     │
     ▼
Server receives binary update
     │
     ▼
Apply update to active server Y.Doc
     │
     ▼
Broadcast update to document room
     │
     ▼
Remote client applies update
     │
     ▼
Remote Tiptap editor updates
```

The client does not resend the complete document after joining.

Initial state transfer and incremental synchronization have different purposes:

```text
Initial join
    → Receive current Y.Doc state

Subsequent editing
    → Exchange incremental Yjs updates
```

Resending the complete document immediately after applying the server's initial state is unnecessary and can produce incorrect behavior if document instances are reconstructed with different Yjs client identities.

---

## Preventing Update Loops

Remote and initial updates must not be emitted back as if they were new local edits.

Conceptually:

```text
Local editor update
       │
       └── Emit to server

Remote update
       │
       └── Apply locally
             │
             └── Do not re-emit

Initial state
       │
       └── Apply locally
             │
             └── Do not re-emit
```

Update origins distinguish synchronization sources and prevent echo loops between clients and the server.

---

# Document Awareness Architecture

Yjs document content and Yjs awareness are different systems.

Document content is durable collaborative state.

Awareness is ephemeral collaboration metadata.

```text
Y.Doc
  │
  └── Shared document content

Awareness
  │
  ├── Active collaborators
  ├── User identity metadata
  ├── Typing state
  ├── Caret information
  └── Remote selection state
```

Awareness should not be persisted as durable document content.

---

## Local Awareness State

Each collaborating client publishes local metadata conceptually similar to:

```text
{
    user: {
        id,
        name,
        avatar,
        color
    },
    typing: false
}
```

The color is deterministically generated from the user's identifier so that the same user receives a stable collaboration color.

The local awareness state is encoded using the Yjs Awareness protocol and transported through Socket.IO.

---

## Awareness Synchronization

```text
Client A local awareness changes
              │
              ▼
    Encode awareness update
              │
              ▼
       awareness:update
              │
              ▼
     Server applies update
              │
              ▼
Server awareness state now contains
all active document collaborators
              │
              ▼
Broadcast update to document room
              │
              ▼
Client B applies remote awareness update
```

When a new collaborator joins, the current awareness state is included in the initial document synchronization response.

This allows the new client to immediately discover existing collaborators.

After applying initial awareness, the joining client publishes its own local state so that existing collaborators can discover it.

---

## Awareness Identity

Awareness state is keyed by a Yjs client ID.

This is distinct from:

- Database user ID.
- Socket ID.
- Session ID.

```text
Database User ID
    └── Persistent application identity

Socket ID
    └── Active network connection identity

Yjs Awareness Client ID
    └── Awareness protocol state identity
```

This distinction is essential during cleanup.

A socket disconnect tells the server which connection disappeared, but awareness removal must ultimately target the corresponding Yjs awareness client ID.

The server therefore maintains the association required to remove the correct awareness state when a socket leaves or disconnects.

---

# Collaboration Carets

Tiptap's `CollaborationCaret` extension consumes the synchronized awareness instance.

```text
Authenticated User
       │
       ▼
Local Awareness State
       │
       ▼
Socket.IO Synchronization
       │
       ▼
Remote Awareness States
       │
       ▼
CollaborationCaret
       │
       ├── Remote caret
       ├── User label
       └── Remote selection highlight
```

The editor does not implement a separate custom cursor synchronization protocol.

Instead:

1. User metadata is published into Yjs awareness.
2. Awareness updates are transported through Socket.IO.
3. Tiptap consumes the shared awareness instance.
4. Remote carets and selections are rendered from synchronized awareness state.

This keeps collaborator identity, awareness transport, and editor visualization connected without duplicating cursor state.

---

# Connection Lifecycle and Cleanup

Real-time systems require explicit lifecycle management. Joining a room is only half of the problem; stale state must also be removed correctly.

TeamHub handles two major exit paths.

## Explicit Navigation Cleanup

When a user intentionally leaves a document or workspace while the global socket remains active:

```text
Route / component unmount
          │
          ▼
Explicit leave event
          │
          ▼
Remove connection-specific state
          │
          ▼
Leave logical Socket.IO room
          │
          ▼
Broadcast updated collaborator state
```

## Global Socket Disconnection

Refreshes, tab closures, network failures, and other connection losses may prevent ordinary navigation cleanup from being sufficient.

The global `disconnecting` lifecycle inspects all rooms joined by the socket:

```text
Socket disconnecting
          │
          ▼
Snapshot current rooms
          │
          ├── workspace:<id>
          │       │
          │       ├── Remove presence connection
          │       └── Broadcast updated presence
          │
          └── document:<id>
                  │
                  ├── Remove awareness client
                  ├── Broadcast awareness removal
                  └── Remove active document connection
```

The room collection is captured before asynchronous work because Socket.IO manages and mutates room membership as disconnection proceeds.

This centralized cleanup ensures that one physical socket disconnect can clean all workspace and document state associated with that connection.

---

# Document Persistence Lifecycle

Collaborative documents use an active in-memory lifecycle.

```text
                  First collaborator joins
                            │
                            ▼
                 Load persisted document
                            │
                            ▼
                  Convert content to Y.Doc
                            │
                            ▼
                Store active document in Map
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       Apply Yjs updates           Serve new collaborators
              │                           │
              └─────────────┬─────────────┘
                            ▼
                  Last collaborator leaves
                            │
                            ▼
                 Convert Y.Doc to JSON
                            │
                            ▼
                    Persist document
                            │
                            ▼
                     Destroy Y.Doc
                            │
                            ▼
                Remove from active Map
```

The server tracks active connections using socket IDs.

When one connection leaves:

```text
Remove socketId
      │
      ▼
Any users remaining?
   │            │
  Yes           No
   │            │
   ▼            ▼
Keep Y.Doc    Persist current state
active            │
                  ▼
              Destroy Y.Doc
                  │
                  ▼
           Remove active document
```

Before destroying the active Y.Doc, the current collaborative content is converted into persistent document data and saved.

The current architecture therefore optimizes for active collaborative sessions while retaining durable document state between sessions.

---

# Authentication and Authorization Architecture

Authentication and authorization are enforced at backend boundaries.

## HTTP Requests

```text
Incoming Request
       │
       ▼
Authentication Middleware
       │
       ▼
Authenticated User
       │
       ▼
Controller / Service
       │
       ▼
Resource Authorization
       │
       ▼
Database Operation
```

## Socket Operations

```text
Socket Connection
       │
       ▼
Socket Authentication
       │
       ▼
Authenticated Socket
       │
       ▼
Protected Event
       │
       ▼
Workspace Membership Check
       │
       ▼
Resource Scope Check
       │
       ▼
Perform Real-Time Operation
```

The client is never treated as the authority for workspace membership or document ownership.

For example, sending both a valid `workspaceId` and `documentId` is insufficient. The backend verifies that:

1. The socket belongs to an authenticated user.
2. The user belongs to the workspace.
3. The document belongs to that workspace.

Only then is the collaborative operation processed.

---

# Architectural Decisions and Trade-offs

| Decision | Reason |
|---|---|
| Feature-oriented frontend architecture | Keeps UI, hooks, services, schemas, and types close to the product capability they support |
| Module-oriented backend architecture | Keeps business domains isolated while allowing shared infrastructure and authorization |
| PostgreSQL for persistent application data | Workspaces, memberships, users, and documents naturally form relational data with strong consistency requirements |
| Prisma as ORM | Provides typed database access, migrations, and schema-driven development |
| TanStack Query for server state | Separates API caching and invalidation from local UI and collaborative CRDT state |
| Socket.IO for real-time transport | Provides event-based communication, rooms, acknowledgements, and connection lifecycle handling |
| Yjs for collaborative editing | Provides CRDT-based concurrent editing and conflict-free update merging |
| Separate workspace presence and document awareness | The systems have different scopes, state models, identities, and lifecycles |
| Socket IDs for active connection tracking | One database user may have multiple simultaneous tabs, devices, or connections |
| Yjs client IDs for awareness state | The awareness protocol identifies states by its own client IDs |
| Active Y.Doc instances in memory | Avoids reconstructing collaborative state for every incremental update during an active session |
| One global Socket.IO connection | Multiple real-time modules can share one physical connection through logical rooms |
| Explicit leave events plus global disconnect cleanup | Normal SPA navigation does not disconnect the global socket, while refreshes and network loss require connection-level cleanup |
| Backend authorization for socket events | Real-time events must enforce the same trust boundaries as REST APIs |

---

# Current Architecture Boundaries

The current real-time architecture intentionally targets a single active backend process.

At present:

- Active Y.Doc instances live in server memory.
- Workspace presence lives in process-local memory.
- Document awareness lives in process-local memory.
- Active connection maps are local to one server process.
- Socket.IO rooms are managed by one real-time server instance.
- Collaborative document persistence occurs around the active document lifecycle.

This is appropriate for the current project stage, but these assumptions become important when considering:

- Multiple backend instances.
- Distributed Socket.IO rooms.
- Cross-instance presence.
- Shared collaborative document ownership.
- Process crashes during active editing.
- Higher document concurrency.

Those concerns are intentionally not solved prematurely in the current architecture.

They are addressed separately in [`SCALING.md`](./SCALING.md), which documents scalability boundaries and the evolution path for a completed V1 system.

---

# Summary

TeamHub's current architecture is built around clear ownership of different state categories:

```text
┌───────────────────────────┬───────────────────────────────┐
│ State                     │ Owner                         │
├───────────────────────────┼───────────────────────────────┤
│ Persistent application    │ PostgreSQL + Prisma           │
│ Frontend server state     │ TanStack Query                │
│ Collaborative documents   │ Yjs                           │
│ Document awareness        │ Yjs Awareness                 │
│ Workspace presence        │ In-memory presence service    │
│ Real-time transport       │ Socket.IO                     │
│ Local interface state     │ React                         │
└───────────────────────────┴───────────────────────────────┘
```

The central architectural idea is not simply that TeamHub uses WebSockets or collaborative editing. It is that each kind of state is handled according to its actual lifecycle and consistency requirements.

Persistent relational data remains in PostgreSQL. API-backed frontend state is managed by TanStack Query. Concurrent document content is owned by Yjs. Ephemeral collaborator metadata is handled through awareness. Workspace-level online state is tracked independently through presence. Socket.IO connects these real-time systems without becoming the owner of their domain semantics.

This separation provides the foundation for TeamHub's current collaboration model while keeping future concerns such as distributed coordination and horizontal scaling explicit rather than hidden behind premature abstraction.