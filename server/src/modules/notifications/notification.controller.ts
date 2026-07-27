import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    serializeNotification
} from "./notification.service.js";
import { getNotificationsSchema } from "./notification.validation.js";
import { getIO } from "../../infrastructure/websocket/socket.js";

export const getNotificationsController = asyncHandler(async (req: Request, res: Response) => {
    const query = getNotificationsSchema.parse(req.query);

    const result = await getNotifications(req.user!.id, query);
    const serializedNotifications = result.notifications.map(serializeNotification);

    res.status(200).json({
        success: true,
        data: {
            notifications: serializedNotifications,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        },
    });
});

export const readNotificationController = asyncHandler(async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId as string;
    const notification = await markNotificationRead(req.user!.id, notificationId);
    
    // Broadcast notification:read to notifications:{userId}
    const socketId = req.headers["x-socket-id"] as string | undefined;
    let broadcast = getIO().to(`notifications:${req.user!.id}`);
    if (socketId) {
        broadcast = broadcast.except(socketId);
    }
    broadcast.emit("notification:read", notificationId);

    res.status(200).json({
        success: true,
        data: serializeNotification(notification),
    });
});

export const readAllNotificationsController = asyncHandler(async (req: Request, res: Response) => {
    await markAllNotificationsRead(req.user!.id);
    
    // Broadcast notification:read-all to notifications:{userId}
    const socketId = req.headers["x-socket-id"] as string | undefined;
    let broadcast = getIO().to(`notifications:${req.user!.id}`);
    if (socketId) {
        broadcast = broadcast.except(socketId);
    }
    broadcast.emit("notification:read-all");

    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
    });
});