import type { Server } from "socket.io";

import { socketAuth } from "./auth.js";

import { registerDocumentSockets } from "../../modules/documents/collaboration/collaboration.socket.js";
import { workspacePresenceSockets } from "../../modules/workspaces/presence/presence.socket.js";

export function initializeWebSocket(io: Server) {
    io.use(socketAuth);

    registerDocumentSockets(io)

    workspacePresenceSockets(io)
}