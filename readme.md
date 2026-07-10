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

Engineering teams often distribute technical specifications, project decisions, discussions, files, and shared knowledge across disconnected tools.

TeamHub explores a different model: a persistent workspace where documents, conversations, collaboration history, and team context remain connected.

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

## Core Features

### ⚡ Real-Time Collaborative Editing

- [x] Multi-user simultaneous document editing.
- [x] CRDT-based synchronization powered by **Yjs**.
- [x] Conflict-free merging of concurrent document changes.
- [x] Live collaborator carets and remote text selections.
- [x] Real-time document awareness and collaborator visibility.
- [x] Synchronization of document updates through **Socket.IO**.
- [x] Persistent document state across collaborative sessions.

### 🟢 Workspace Presence & Awareness

- [x] Real-time online and offline workspace presence.
- [x] Socket connection tracking for active workspace members.
- [x] Live presence synchronization across connected clients.
- [x] Automatic cleanup when users leave, refresh, or disconnect.
- [x] Document-level awareness independent of workspace-level presence.
- [ ] Activity-aware presence states such as active and away.

### 💬 Real-Time Workspace Chat

- [ ] Workspace-scoped team conversations.
- [ ] Real-time message delivery through Socket.IO.
- [ ] Message editing and deletion.
- [ ] Persistent message history.
- [ ] Unread message counts.
- [ ] Reconnection-aware synchronization.

### 💭 Contextual Comments & Discussions

- [ ] Comments attached directly to collaborative document content.
- [ ] Threaded discussions around document context.
- [ ] Reply and resolution workflows.
- [ ] Real-time comment synchronization.
- [ ] Author attribution and timestamps.

### 🕘 Document Version History

- [ ] Persistent document revisions.
- [ ] Historical version browsing.
- [ ] Restore previous document versions.
- [ ] Version metadata and author attribution.
- [ ] Compare document revisions where applicable.

### 🔔 Real-Time Notifications

- [ ] Persistent in-app notification center.
- [ ] Real-time notification delivery.
- [ ] Read and unread notification states.
- [ ] Workspace-scoped notification events.
- [ ] Upstash Redis-backed infrastructure for selected real-time and ephemeral workflows.

### 🔐 Workspace Isolation & Authorization

- [x] Authenticated workspace access.
- [x] Workspace membership validation at backend boundaries.
- [x] Owner and member role differentiation.
- [x] Protected workspace resources and operations.
- [x] Workspace-scoped data isolation.
- [x] Authorization checks across REST and WebSocket operations.

### 📁 Shared Workspace Files

- [ ] Workspace-scoped file management.
- [ ] Shared engineering resources within workspace context.
- [ ] File metadata and organization.
- [ ] Secure resource access based on workspace membership.

### 📊 Activity & Workspace Context

- [ ] Persistent activity feed for meaningful workspace events.
- [ ] Document, member, comment, and communication activity.
- [ ] Actor attribution and timestamps.
- [ ] Chronological workspace history.

### 🛡️ API Protection & Rate Limiting

- [ ] Distributed API rate limiting with **Upstash Rate Limit**.
- [ ] Protection for authentication and sensitive API operations.
- [ ] Serverless-compatible rate limiting backed by Upstash Redis.

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

### CRDT-Based Collaborative Editing

TeamHub uses **Yjs** to synchronize concurrent document edits without relying on traditional last-write-wins behavior. Multiple users can modify the same document simultaneously while CRDT updates are merged into a consistent shared state.

### Separate Presence and Document Awareness Models

Workspace presence and collaborative document awareness solve different problems and are intentionally modeled independently:

- **Workspace presence** tracks which members are currently connected to a workspace.
- **Document awareness** tracks ephemeral collaboration state such as active editors, remote carets, selections, and typing state.

This separation prevents document-specific collaboration concerns from becoming tightly coupled to general workspace presence.

### Real-Time Lifecycle Management

Socket connections are tracked across workspace and document rooms with explicit handling for:

- Joining collaborative sessions.
- Navigating away from workspaces or documents.
- Browser refreshes and tab closure.
- Unexpected socket disconnections.
- Removal of stale presence and awareness state.
- Broadcasting updated collaborator state to remaining clients.

### Workspace-Scoped Authorization

Backend operations validate workspace membership before exposing protected resources or accepting real-time updates. Authorization boundaries apply to both traditional REST operations and WebSocket events.

### Server State and Real-Time Synchronization

**TanStack Query** manages persistent server state on the client, while Socket.IO events update time-sensitive collaboration state. This allows the application to combine cached API data with real-time changes without making the WebSocket layer responsible for all application state.

### Persistent Collaborative Documents

Collaborative Yjs document state is maintained while users actively work on a document and persisted when appropriate, allowing real-time editing sessions to coexist with durable document storage.

### Distributed Infrastructure with Upstash

TeamHub uses **Upstash Redis** and **Upstash Rate Limit** for selected infrastructure concerns that benefit from globally accessible, serverless-compatible distributed state without requiring a permanently running self-hosted Redis instance.

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

Environment variables include configuration for:

- Backend API URL
- PostgreSQL database connection
- Authentication secrets
- Upstash Redis
- Upstash Rate Limit
- File storage provider
- Other deployment-specific services

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