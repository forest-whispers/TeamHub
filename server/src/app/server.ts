import "../config/env.ts";

import http from "http";

import app from "./app.js";
import { env} from "../config/env.ts"
import { createSocket } from "../infrastructure/websocket/socket.js";
import { initializeWebSocket } from "../infrastructure/websocket/index.js";

const server = http.createServer(app);
const io = createSocket(server);
initializeWebSocket(io);

const PORT = env.PORT

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});