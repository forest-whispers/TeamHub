import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_BASE_URL
    ? new URL(import.meta.env.VITE_API_BASE_URL).origin
    : window.location.origin;

export const socket = io(socketUrl, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
});