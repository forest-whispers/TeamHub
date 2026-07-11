<div align="center">

# TeamHub

### A persistent collaborative workspace for engineering teams.

Bring real-time documents, team communication, shared context, and engineering workflows together inside one workspace.

<!-- Add TeamHub banner/logo here -->

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Yjs](https://img.shields.io/badge/Yjs-F7DF1E?style=for-the-badge&logo=yjs&logoColor=black)
![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-00E9A3?style=for-the-badge&logo=upstash&logoColor=white)

<br />

**Real-Time Collaboration · CRDT Editing · Workspace Presence · Team Chat · Version History · Notifications**

</div>

---

## Overview

**TeamHub** is a full-stack collaborative engineering workspace that brings documents, real-time editing, communication, files, activity, and team context into one persistent environment.

Instead of distributing engineering knowledge across disconnected chat apps, document editors, file stores, and project tools, TeamHub keeps collaboration attached to the workspace where the work actually happens.

```text
            Documents + Real-Time Editing + Chat + Comments + Version History
                                          +
                           Presence + Notifications + Files
                                          │
                                          ▼
                                 Persistent Workspace
```

---

## Product Preview

### Landing Page

<p align="center">
  <img src="./assets/landing-page.gif" alt="TeamHub landing page" />
</p>

### Workspace Experience

<table>
  <tr>
    <th>Workspace Home</th>
    <th>Collaborative Documents</th>
  </tr>
  <tr>
    <td>
      <img src="./assets/workspace-home.png" alt="TeamHub workspace home" />
    </td>
    <td>
      <img src="./assets/documents.png" alt="TeamHub collaborative documents" />
    </td>
  </tr>
</table>

### Team Collaboration

<table>
  <tr>
    <th>Workspace Members</th>
    <th>Real-Time Chat</th>
  </tr>
  <tr>
    <td>
      <img src="./assets/members.png" alt="TeamHub workspace members" />
    </td>
    <td>
      <img src="./assets/chat.png" alt="TeamHub real-time workspace chat" />
    </td>
  </tr>
</table>

---

## Why TeamHub?

Modern engineering work is fragmented across document editors, chat applications, project trackers, and file storage.

TeamHub explores a workspace-first model where collaboration, documentation, communication, and shared context remain connected in one persistent environment.

```text
                              Workspace
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
               ▼                  ▼                  ▼
           Documents            Chat              Files
               │                  │                  │
               ├── Live Editing   ├── Messages       └── Shared Resources
               ├── Comments       ├── Unread State
               ├── Versions       └── Real-Time Sync
               └── Presence
                                  │
                                  ▼
                       Activity & Notifications
```

---

🚧 TeamHub is currently under active development. The README describes the planned V1 feature set. Implemented features are marked in the checklist below.

## Core Features

### ⚡ Real-Time Collaborative Editing

- [x] Multi-user collaborative editing powered by **Yjs** CRDTs.
- [x] Conflict-free synchronization of concurrent document changes.
- [x] Live collaborator awareness, carets, and text selections.
- [x] Real-time document synchronization via **Socket.IO**.
- [x] Persistent collaborative document state.

### 🟢 Workspace Presence & Awareness

- [x] Real-time workspace member presence.
- [x] Live presence synchronization across connected clients.
- [x] Automatic connection and disconnection lifecycle management.
- [x] Independent workspace presence and document awareness models.
- [ ] Activity-aware presence states (Active, Away, etc.).

### 💬 Real-Time Workspace Chat

- [ ] Workspace-scoped team conversations.
- [ ] Real-time messaging with persistent history.
- [ ] Message editing and deletion.
- [ ] Unread message tracking.
- [ ] Reconnection-aware synchronization.

### 💭 Contextual Comments & Discussions

- [ ] Document-attached comments and threaded discussions.
- [ ] Replies, resolutions, and author attribution.
- [ ] Real-time comment synchronization.

### 🕘 Document Version History

- [ ] Persistent document revisions.
- [ ] Browse, compare, and restore historical versions.
- [ ] Version metadata and author attribution.

### 🔔 Real-Time Notifications

- [ ] Persistent in-app notification center.
- [ ] Real-time notification delivery and read states.
- [ ] Workspace-scoped notification events.
- [ ] Upstash Redis-backed notification infrastructure.

### 🔐 Workspace Isolation & Authorization

- [x] Authenticated workspace access.
- [x] Workspace-scoped authorization and data isolation.
- [x] Role-based permissions for owners and members.
- [x] Authorization across REST and WebSocket operations.

### 📁 Shared Workspace Files

- [ ] Workspace-scoped file management.
- [ ] Shared resources with secure member access.
- [ ] File organization and metadata.

### 📊 Activity & Workspace Context

- [ ] Persistent workspace activity feed.
- [ ] Member, document, comment, and chat events.
- [ ] Chronological history with actor attribution.

### 🛡️ API Protection & Rate Limiting

- [ ] Distributed API rate limiting with **Upstash Rate Limit**.
- [ ] Protection for authentication and sensitive endpoints.
- [ ] Serverless-compatible Redis-backed infrastructure.

---

## Workspace Collaboration Model

TeamHub organizes collaboration around persistent workspaces. Each workspace acts as an isolated boundary for members, documents, communication, files, activity, and notifications.

```text
                                   User
                                     │
                                     ▼
                                Dashboard
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                           ▼
                  Workspace A                  Workspace B
                       │
            ┌──────────┼──────────┬──────────┬──────────┐
            │          │          │          │          │
            ▼          ▼          ▼          ▼          ▼
        Documents    Members     Chat       Files     Activity
            │
            ├── Real-Time Editing
            ├── Collaboration Carets
            ├── Comments
            ├── Version History
            └── Document Awareness
                       │
                       ▼
             Notifications & Shared Context
```

A user may belong to multiple workspaces, but every workspace maintains its own membership boundary, collaborative resources, communication history, and authorization rules.

---

## Architecture Preview

TeamHub separates persistent application data, server state, collaborative document synchronization, and ephemeral real-time presence according to their different responsibilities.

```text
         ┌──────────────────────────────────────────────────────────────┐
         │                       CLIENT APPLICATION                     │
         │                                                              │
         │       React + TypeScript + TanStack Query + Yjs             │
         └──────────────────────────────┬───────────────────────────────┘
                                        │
                          ┌─────────────┴─────────────┐
                          │                           │
                          ▼                           ▼
                      REST API                 WebSocket Events
                          │                           │
                          │                 Socket.IO + Yjs Updates
                          │                           │
                          └─────────────┬─────────────┘
                                        ▼
         ┌──────────────────────────────────────────────────────────────┐
         │                         BACKEND                              │
         │                                                              │
         │              Node.js + Express.js + TypeScript              │
         │                                                              │
         │    Authentication · Authorization · Services · Real-Time    │
         └──────────────────────────────┬───────────────────────────────┘
                                        │
                          ┌─────────────┴─────────────┐
                          │                           │
                          ▼                           ▼
                  Prisma + PostgreSQL          Upstash Redis
                          │                           │
                          │                 Notifications / Rate
                          │                 Limiting / Ephemeral
                          │                 Infrastructure
                          ▼
                Persistent Application Data
```

### Data responsibilities

- **PostgreSQL** stores persistent application data such as users, workspaces, memberships, documents, messages, comments, versions, notifications, and activity.
- **Yjs** manages CRDT-based collaborative document state and concurrent update merging.
- **Socket.IO** transports real-time document updates, awareness, presence, chat events, and other live workspace events.
- **Upstash Redis** supports selected ephemeral and distributed infrastructure requirements such as notification delivery workflows and rate limiting.
- **TanStack Query** manages server state, caching, invalidation, and synchronization between API responses and real-time events on the client.

---

## Engineering Highlights

Rather than focusing only on features, TeamHub is designed around a set of architectural decisions that support real-time collaboration, workspace isolation, and scalable synchronization. The following highlights summarize some of the core engineering concepts behind the project.

### CRDT-Based Collaborative Editing

TeamHub uses **Yjs** CRDTs to merge concurrent document edits without relying on traditional last-write-wins conflict resolution. Multiple users can edit the same document simultaneously while maintaining a consistent shared state.

### Separate Presence and Document Awareness Models

TeamHub models workspace presence and document awareness as separate systems because they solve different collaboration problems:

- **Workspace presence** tracks which members are currently connected to a workspace.
- **Document awareness** tracks ephemeral collaboration state such as active editors, remote carets, selections, and typing state.

Keeping these concerns separate simplifies lifecycle management and prevents document-specific collaboration from becoming tightly coupled to general workspace connectivity.

### Server State and Real-Time Synchronization

**TanStack Query** manages cached server state on the client, while **Socket.IO** delivers time-sensitive collaboration events. Separating these responsibilities allows cached API data and real-time updates to work together without making the WebSocket layer responsible for all application state.

### Real-Time Lifecycle Management

TeamHub explicitly manages connection lifecycles across workspace and document rooms, including:

- Joining collaborative sessions.
- Navigating between workspaces and documents.
- Browser refreshes and tab closures.
- Unexpected socket disconnections.
- Removal of stale presence and awareness state.
- Broadcasting updated collaborator state to remaining clients.

### Workspace-Scoped Authorization

Every protected operation validates workspace membership before exposing resources or accepting updates. Authorization boundaries are enforced consistently across both REST endpoints and WebSocket events.

### Server State and Real-Time Synchronization

**TanStack Query** manages persistent server state on the client, while Socket.IO events update time-sensitive collaboration state. This allows the application to combine cached API data with real-time changes without making the WebSocket layer responsible for all application state.

### Persistent Collaborative Documents

Collaborative **Yjs** document state remains synchronized while users actively edit and is persisted when appropriate, allowing real-time collaboration to coexist with durable document storage.

### Distributed Infrastructure with Upstash

**Upstash Redis** and **Upstash Rate Limit** support distributed infrastructure such as notification workflows and API rate limiting, providing globally accessible state without requiring a self-managed Redis deployment.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, TypeScript, React Router, TanStack Query, Axios |
| **UI & Forms** | Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| **Rich Text Editor** | Tiptap |
| **Collaborative Editing** | Yjs, Yjs Awareness Protocol, Tiptap Collaboration |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Real-Time Communication** | Socket.IO |
| **Distributed Infrastructure** | Upstash Redis, Upstash Rate Limit |
| **Authentication** | JWT-based authentication and secure HTTP-only cookies |
| **File Storage** | To be finalized for V1 |
| **Deployment** | To be documented after V1 deployment |

---

## Project Structure

```text
teamhub/
│
├── client/
│   └── src/
│       ├── features/
│       ├── shared/
│       └── ...
│
├── server/
│   └── src/
│       ├── modules/
│       ├── middleware/
│       ├── events/
│       ├── infrastructure/
│       ├── shared/
│       └── ...
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── FLOWS.md
│   ├── API.md
│   ├── apiContracts.md
│   └── SCALING.md
│
└── README.md
```

The codebase follows a feature-oriented structure so that major product domains such as workspaces, documents, collaboration, presence, chat, comments, notifications, and version history can evolve without concentrating unrelated logic into a single application layer.

---

## Documentation

More detailed technical documentation is available inside the [`docs`](./docs) directory.

| Document | Description |
|---|---|
| [`ARCHITECTURE.md`](./docs/architecture.md) | System architecture, module boundaries, real-time infrastructure, and major engineering decisions. |
| [`DATABASE.md`](./docs/database.md) | Database models, relationships, indexes, constraints, and persistence decisions. |
| [`FLOWS.md`](./docs/flows.md) | Important application flows such as authentication, collaborative editing, presence, and real-time synchronization. |
| [`API.md`](./docs/api.md) | High-level REST and WebSocket API reference. |
| [`apiContracts.md`](./docs/apiContracts.md) | Detailed request and response contracts used by the frontend and backend. |
| [`SCALING.md`](./docs/scaling.md) | Current scalability boundaries, bottlenecks, and future horizontal scaling strategy. |

---

## Getting Started

### Prerequisites

Make sure the following are available:

- Node.js
- npm
- PostgreSQL
- An Upstash account for Redis and rate limiting features

### 1. Clone the repository

```bash
git clone https://github.com/forest-whispers/TeamHub.git
cd teamhub
```

### 2. Install dependencies

```bash
npm install-all
```

### 3. Configure environment variables

Create the required environment files for the client and server.

```text
client/
└── .env

server/
└── .env
```

Refer to the example environment files in the repository for the exact required variables.

### 4. Apply database migrations

```bash
npx prisma format
npx prisma migrate dev
```

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

---

## Deployment

Deployment infrastructure will be documented once TeamHub V1 is finalized and deployed.

The production architecture will include:

```text
       Frontend Application
                     │
                     ▼
       Backend API + WebSocket Server
                     │
                     ├──────────► PostgreSQL
                     │
                     └──────────► Upstash Redis
```

The exact hosting providers and production configuration will be added after deployment rather than documenting assumptions that may change during development.

---

## Roadmap — Beyond V1

The following capabilities are intentionally outside the initial V1 scope and represent possible future evolution of TeamHub.

### 🎙️ WebRTC Collaborative Discussions

Real-time voice and video discussions directly inside collaborative document sessions, allowing teams to discuss content without leaving the workspace.

### 🖥️ Interactive Presentation Mode

Transform workspace documents into presentation-ready slides for:

- Hackathon submissions.
- Technical demonstrations.
- Architecture reviews.
- Project presentations.

### 📈 Advanced Workspace Analytics

Deeper insights into:

- Document activity.
- Collaboration patterns.
- Member participation.
- Workspace growth.
- Communication trends.

### 🌐 Horizontal Real-Time Scaling

Scale Socket.IO and collaborative document sessions across multiple backend instances using distributed coordination and Redis-backed adapters where appropriate.

### 🔎 Advanced Workspace Search

Unified search across:

- Documents.
- Messages.
- Comments.
- Files.
- Members.
- Workspace activity.

### 📴 Offline-First Collaborative Editing

Continue editing during temporary network loss and reconcile CRDT updates automatically when connectivity returns.

### 🧠 AI-Powered Workspace Intelligence

Potential capabilities include:

- Cross-document semantic search.
- Workspace knowledge Q&A.
- Discussion summarization.
- Decision extraction.
- Document summaries.
- Context-aware engineering assistance.

### 🔗 Developer Integrations

Integrations with engineering and collaboration platforms such as GitHub, Slack, Linear, and Jira.

---

## Current Status

> **TeamHub is under active development.**

The current focus is completing the V1 collaboration experience, including real-time document editing, workspace presence, chat, comments, version history, notifications, activity tracking, shared files, and infrastructure hardening.

The README represents the intended complete V1 product. Detailed technical documentation evolves alongside the corresponding implemented systems to ensure that architecture, database, flow, and API documentation remain accurate.

---

## License

This project is licensed under the MIT License.

---

<div align="center">

### Built to explore how real-time editing, persistent workspaces, and engineering collaboration can exist as one connected system.

**TeamHub — where documents, conversations, and team context stay together.**

</div>