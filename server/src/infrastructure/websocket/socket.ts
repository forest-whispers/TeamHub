import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { env } from "../../config/env.js";

let io: Server;

const allowedOrigins = ['http://localhost:5173'];
// const allowedOrigins = env.CLIENT_ORIGINS?.split(',') || ['http://localhost:5173'];

export function createSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
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