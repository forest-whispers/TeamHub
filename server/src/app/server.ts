import "../config/env.ts";

import http from "http";

import app from "./app.js";
import { createSocket } from "../infrastructure/websocket/socket.js";
import { initializeWebSocket } from "../infrastructure/websocket/index.js";

const server = http.createServer(app);
const io = createSocket(server);
initializeWebSocket(io);

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});