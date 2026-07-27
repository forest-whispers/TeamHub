
import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    toggleReaction,
} from "./chat.service.js";

export const getMessagesController = asyncHandler(async (req: Request, res: Response) => {
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    
    const rawLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

    const limit = rawLimit !== undefined && Number.isFinite(rawLimit) ? rawLimit : undefined;
    res.json(
        await getMessages(
            req.user!.id,
            req.params.workspaceId,
            req.params.documentId,
            cursor,
            limit
        )
    );
});

export const sendMessageController = asyncHandler(async (req: Request, res: Response) => {
    const socketId = req.headers["x-socket-id"] as string | undefined;
    res.status(201).json(
        await sendMessage(
            req.user!.id,
            req.params.workspaceId,
            req.params.documentId,
            req.body,
            socketId
        )
    );
});

export const editMessageController = asyncHandler(async (req: Request, res: Response) => {
    const socketId = req.headers["x-socket-id"] as string | undefined;
    res.json(
        await editMessage(
            req.user!.id,
            req.params.workspaceId,
            req.params.documentId,
            req.params.messageId,
            req.body,
            socketId
        )
    );
});

export const deleteMessageController = asyncHandler(async (req: Request, res: Response) => {
    const socketId = req.headers["x-socket-id"] as string | undefined;
    await deleteMessage(
        req.user!.id,
        req.params.workspaceId,
        req.params.documentId,
        req.params.messageId,
        socketId
    );

    res.sendStatus(204);
});

export const pinMessageController = asyncHandler(async (req: Request, res: Response) => {
    const socketId = req.headers["x-socket-id"] as string | undefined;
    res.json(
        await pinMessage(
            req.user!.id,
            req.params.workspaceId,
            req.params.documentId,
            req.params.messageId,
            socketId
        )
    );
});

export const unpinMessageController = asyncHandler(async (req: Request, res: Response) => {
    const socketId = req.headers["x-socket-id"] as string | undefined;
    res.json(
        await unpinMessage(
            req.user!.id,
            req.params.workspaceId,
            req.params.documentId,
            req.params.messageId,
            socketId
        )
    );
});

export const toggleReactionController = asyncHandler(
    async (req: Request, res: Response) => {

        const socketId = req.headers["x-socket-id"] as string | undefined;

        res.json(
            await toggleReaction(
                req.user!.id,
                req.params.workspaceId,
                req.params.documentId,
                req.params.messageId,
                req.body,
                socketId
            )
        );
    }
);