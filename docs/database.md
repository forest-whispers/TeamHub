# Database Design

## Overview

TeamHub uses **PostgreSQL** as its primary relational database, with **Prisma ORM** providing schema definition, migrations, relations, and type-safe database access.

The current schema is intentionally compact and models the core persistent entities required by the application:

- Users and authentication sessions.
- Workspaces and ownership.
- Workspace membership with role-based access.
- Documents and their persisted collaborative content.

Not every piece of application state belongs in PostgreSQL. Real-time workspace presence, active document collaborators, awareness states, and active Yjs documents are ephemeral runtime state and are managed separately from the relational database.

```text
PostgreSQL stores:
    Users
    Sessions
    Workspaces
    Memberships
    Documents
    Persisted document content

Runtime memory stores:
    Active workspace connections
    Workspace presence
    Active Y.Doc instances
    Document awareness
    Collaboration caret state
```

---

## Entity Relationship Model

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ├──────────── owns ────────────────┐
       │                                  ▼
       │                         ┌─────────────────┐
       │                         │    Workspace    │
       │                         └────────┬────────┘
       │                                  │
       │                                  │ contains
       │                                  ▼
       │                         ┌─────────────────┐
       │                         │    Document     │
       │                         └─────────────────┘
       │                                  ▲
       │                                  │ created by
       ├──────────────────────────────────┘
       │
       ├──────── has ─────────────────────┐
       │                                  ▼
       │                         ┌─────────────────┐
       │                         │     Session     │
       │                         └─────────────────┘
       │
       │
       │        ┌─────────────────────────┐
       └───────►│    WorkspaceMember      │◄────── Workspace
                └─────────────────────────┘
                     membership relation
```

The central relationship structure is:

```text
User ───────< Session

User ───────< Workspace
               as owner

User ───────< WorkspaceMember >─────── Workspace

Workspace ───────< Document

User ────────────< Document
                    as creator
```

---

## Schema Summary

| Model | Responsibility |
|---|---|
| `User` | User identity, credentials, verification state, and authentication revocation version |
| `Session` | Persistent refresh-token sessions and session lifecycle metadata |
| `Workspace` | Top-level collaboration boundary owned by a user |
| `WorkspaceMember` | Many-to-many relationship between users and workspaces with an assigned role |
| `Document` | Persistent document metadata and serialized collaborative content |

---

## User

The `User` model represents the persistent identity of a TeamHub user.

```prisma
model User {
  id              String  @id @default(uuid())
  name            String
  email           String  @unique
  password        String
  avatar          String?
  isEmailVerified Boolean @default(false)

  workspaces  Workspace[]       @relation("WorkspaceOwner")
  memberships WorkspaceMember[]
  sessions    Session[]
  documents   Document[]

  tokenVersion Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Design decisions

**UUID identifiers** are used for users because user identity is externally referenced throughout the application and does not need sequential identifiers.

The `email` field is unique, enforcing one account per email address at the database level rather than relying exclusively on application validation.

`tokenVersion` provides a server-controlled mechanism for invalidating previously issued authentication tokens when required.

The user participates in several distinct relationships:

```text
User
├── owns many Workspaces
├── belongs to many Workspaces through WorkspaceMember
├── has many Sessions
└── creates many Documents
```

Workspace ownership and workspace membership are intentionally separate concepts. A user can own one workspace while participating as an admin or member in others.

---

## Session

The `Session` model stores persistent authentication sessions.

```prisma
model Session {
  id               String    @id @default(cuid())
  refreshTokenHash String
  expiresAt        DateTime
  lastUsedAt       DateTime?

  userId String
  user   User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  createdAt DateTime @default(now())

  @@index([userId])
}
```

Only the **hash of the refresh token** is stored rather than the raw token itself.

This reduces the impact of a database leak because stored session records cannot directly be reused as valid refresh tokens.

The model also stores:

- `expiresAt` — absolute session expiration.
- `lastUsedAt` — optional session activity metadata.
- `createdAt` — session creation timestamp.

The `userId` index supports efficient lookup of all sessions belonging to a particular user.

### Deletion behavior

```text
Delete User
    │
    ▼
Delete all associated Sessions
```

Sessions have no meaningful existence without their user, so `onDelete: Cascade` is appropriate.

---

## Workspace

A workspace is TeamHub's primary collaboration and authorization boundary.

```prisma
model Workspace {
  id          String  @id @default(cuid())
  name        String
  description String?
  color       String?
  inviteCode  String  @unique

  ownerId String
  owner   User @relation(
    "WorkspaceOwner",
    fields: [ownerId],
    references: [id],
    onDelete: Cascade
  )

  members   WorkspaceMember[]
  documents Document[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
}
```

Each workspace has exactly one owner and may contain multiple:

- Members.
- Documents.

The `inviteCode` is globally unique and provides a stable database-level guarantee against duplicate workspace invitation codes.

The `ownerId` index supports queries such as retrieving workspaces owned by a particular user.

### Workspace as an isolation boundary

Documents are directly associated with a workspace:

```text
Workspace A
├── Members
└── Documents

Workspace B
├── Members
└── Documents
```

Knowing a document ID alone is not sufficient authorization. Application services verify that the authenticated user belongs to the relevant workspace and that the requested document belongs to that workspace.

### Deletion behavior

Deleting a workspace cascades to:

```text
Workspace
├── WorkspaceMember records
└── Documents
```

This prevents orphaned memberships and documents after the parent workspace ceases to exist.

---

## Workspace Membership

`WorkspaceMember` models the many-to-many relationship between users and workspaces.

```prisma
enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
}

model WorkspaceMember {
  id       String        @id @default(cuid())
  role     WorkspaceRole @default(MEMBER)
  joinedAt DateTime      @default(now())
  updatedAt DateTime     @updatedAt

  workspaceId String
  workspace   Workspace @relation(
    fields: [workspaceId],
    references: [id],
    onDelete: Cascade
  )

  userId String
  user   User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@unique([workspaceId, userId])
  @@index([userId])
}
```

The membership record carries role information:

| Role | Meaning |
|---|---|
| `OWNER` | Workspace owner with the highest workspace authority |
| `ADMIN` | Elevated workspace management permissions |
| `MEMBER` | Standard workspace participant |

### Composite uniqueness

The most important database constraint on membership is:

```prisma
@@unique([workspaceId, userId])
```

This guarantees that the same user cannot have multiple membership rows for the same workspace.

Without this constraint:

```text
workspace-123 + user-456
workspace-123 + user-456
workspace-123 + user-456
```

could exist as duplicate memberships.

With the composite unique constraint, the database enforces:

```text
One user + one workspace = at most one membership
```

### Why membership is a separate model

A direct many-to-many relation would not be sufficient because the relationship itself contains domain data:

```text
Membership
├── role
├── joinedAt
└── updatedAt
```

Therefore, `WorkspaceMember` is a first-class model rather than an implicit join table.

---

## Document

The `Document` model stores persistent document metadata and serialized content.

```prisma
enum DocumentType {
  DOCUMENT
  MEETING_NOTES
  PRESENTATION
}

model Document {
  id String @id @default(cuid())

  title String
  icon  String?

  content Json

  type DocumentType @default(DOCUMENT)

  workspaceId String
  workspace   Workspace @relation(
    fields: [workspaceId],
    references: [id],
    onDelete: Cascade
  )

  createdById String
  createdBy   User @relation(
    fields: [createdById],
    references: [id]
  )

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workspaceId])
  @@index([createdById])
}
```

Each document belongs to exactly one workspace and records the user who created it.

The `DocumentType` enum currently supports:

```text
DOCUMENT
MEETING_NOTES
PRESENTATION
```

This allows document behavior and presentation to evolve by type without requiring separate tables for each document category.

---

## Collaborative Document Persistence

The most important database-specific architectural decision in TeamHub is how collaborative document content is persisted.

The database does **not** receive a write for every keystroke.

During an active collaborative session:

```text
PostgreSQL JSON content
          │
          ▼
     Load document
          │
          ▼
   Convert to Y.Doc
          │
          ▼
┌───────────────────────────┐
│ Active collaborative      │
│ session                   │
│                           │
│ User A ──┐                │
│ User B ──┼──► Active Y.Doc│
│ User C ──┘                │
└────────────┬──────────────┘
             │
             ▼
    Last collaborator leaves
             │
             ▼
     Convert Y.Doc to JSON
             │
             ▼
       Persist content
             │
             ▼
         PostgreSQL
```

The `content` field uses PostgreSQL JSON through Prisma's `Json` type.

This is appropriate because Tiptap document content is naturally represented as a structured document tree rather than a plain text string.

A simplified example:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Collaborative document content"
        }
      ]
    }
  ]
}
```

### Why not persist every Yjs update immediately?

Writing every incremental collaborative update directly to the primary relational database would create unnecessary write pressure and tightly couple typing frequency to database activity.

The current lifecycle instead separates:

```text
Active collaborative state
        → Y.Doc in server memory

Durable document state
        → JSON in PostgreSQL
```

When the final active collaborator leaves, the current Y.Doc is serialized and persisted before the in-memory document is destroyed.

This is an intentional V1 trade-off. It keeps the collaborative model straightforward, but it also means the persistence strategy has limitations around unexpected process termination during an active editing session. Those scalability and durability concerns are addressed separately in `SCALING.md`.

---

## Indexing Strategy

The current schema uses indexes around the primary access patterns already present in the application.

| Model | Index | Purpose |
|---|---|---|
| `Session` | `userId` | Find sessions belonging to a user |
| `Workspace` | `ownerId` | Find workspaces owned by a user |
| `WorkspaceMember` | `userId` | Find workspace memberships for a user |
| `Document` | `workspaceId` | Find documents belonging to a workspace |
| `Document` | `createdById` | Find documents created by a user |

Several fields are also indexed implicitly because they are primary keys or unique:

```text
User.id
User.email

Workspace.id
Workspace.inviteCode

WorkspaceMember.id
(workspaceId, userId)

Document.id

Session.id
```

Indexes are added based on actual query patterns rather than indexing every foreign key or frequently mentioned field by default.

As the application evolves, additional indexes should be driven by:

- Real query patterns.
- Query execution plans.
- Pagination requirements.
- Filtering and sorting behavior.
- Measured performance bottlenecks.

---

## Referential Integrity and Cascade Behavior

The schema uses database relationships to preserve consistency between parent and child records.

| Parent Deleted | Result |
|---|---|
| User | Owned workspaces are deleted |
| User | User sessions are deleted |
| User | Workspace membership records are deleted |
| Workspace | Membership records are deleted |
| Workspace | Documents are deleted |

Document creator deletion is intentionally different in the current schema:

```prisma
createdBy User @relation(fields: [createdById], references: [id])
```

No explicit `onDelete` behavior is configured for this relation.

This means user deletion semantics must account for documents created by that user. If user deletion becomes a supported product workflow, this relationship will require an explicit product decision—for example:

- Prevent deletion while authored documents exist.
- Preserve documents and make the creator nullable.
- Transfer attribution.
- Use a soft-delete strategy for users.

This should be decided from product behavior rather than adding cascade deletion automatically, since deleting a user should not necessarily delete collaborative workspace documents they created.

---

## Database Boundaries

Not all TeamHub state is persisted in PostgreSQL.

| State | Storage |
|---|---|
| Users | PostgreSQL |
| Authentication sessions | PostgreSQL |
| Workspaces | PostgreSQL |
| Workspace memberships | PostgreSQL |
| Document metadata | PostgreSQL |
| Durable document content | PostgreSQL JSON |
| Active Y.Doc | Server memory |
| Document awareness | Server memory |
| Workspace presence | Server memory |
| Active socket connections | Server memory |

The database owns **durable application state**.

The real-time layer owns **active session state**.

This distinction prevents ephemeral data such as cursor positions, online indicators, and active socket connections from being unnecessarily persisted as permanent records.

---

## Summary

The current TeamHub database model is intentionally centered on a small number of strong relational boundaries:

```text
User
 │
 ├── Sessions
 │
 ├── Owned Workspaces
 │
 ├── Workspace Memberships
 │
 └── Created Documents
          │
          ▼
      Workspace
       │      │
       │      └── Documents
       │
       └── Members
```

The most important database decisions are:

- PostgreSQL stores durable application state.
- Prisma defines typed relationships and schema constraints.
- Workspace membership is modeled explicitly because the relationship carries role and lifecycle data.
- Composite uniqueness prevents duplicate workspace memberships.
- Cascades remove dependent records where their parent no longer exists.
- Collaborative document content is persisted as structured JSON rather than written to PostgreSQL on every keystroke.
- Active Yjs documents, awareness, and workspace presence remain outside the relational database because they are ephemeral runtime state.
- Indexes follow actual access patterns rather than premature optimization.

The schema is deliberately small at the current stage. Additional persistent models should be introduced as their corresponding product features are actually implemented, allowing the database design to evolve from real application requirements rather than speculative abstractions.