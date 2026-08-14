import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { allowedOrigins } from "../../app/app.js";

let io: Server;

export function createSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
        origin: allowedOrigins,
        credentials: true,
        },
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized.");
    }

    return io;
}