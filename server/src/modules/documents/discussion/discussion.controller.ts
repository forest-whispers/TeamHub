import type { Request, Response } from "express";

import asyncHandler from "../../../shared/utils/asyncHandler.js";
import { getDiscussions, createDiscussion, replyDiscussion, resolveDiscussion, deleteDiscussion, deleteReply } from "./discussion.service.js"

import { createDiscussionSchema, replyDiscussionSchema, resolveDiscussionSchema, } from "./discussion.types.ts";

export const getDiscussionsController = asyncHandler(async (req: Request, res: Response) => {
    const discussions = await getDiscussions(
        req.user.id,
        req.params.workspaceId,
        req.params.documentId
    );

    res.status(200).json({
        success: true,
        data: discussions,
    });
});

export const createDiscussionController = asyncHandler(async (req: Request, res: Response) => {
    const input = createDiscussionSchema.parse(req.body);

    const discussion = await createDiscussion(
        req.user.id,
        req.params.workspaceId,
        req.params.documentId,
        input
    );

    res.status(201).json({
        success: true,
        data: discussion,
    });
});

export const replyDiscussionController = asyncHandler(async (req: Request, res: Response) => {
    const input = replyDiscussionSchema.parse(req.body);

    const reply = await replyDiscussion(
        req.user.id,
        req.params.discussionId,
        input
    );

    res.status(201).json({
        success: true,
        data: reply,
    });
});

export const resolveDiscussionController = asyncHandler(async (req: Request, res: Response) => {
    const input = resolveDiscussionSchema.parse(req.body);

    const discussion = await resolveDiscussion(
        req.user.id,
        req.params.discussionId,
        input.resolved
    );

    res.status(200).json({
        success: true,
        data: discussion,
    });
});

export const deleteDiscussionController = asyncHandler(async (req: Request, res: Response) => {
    await deleteDiscussion(
        req.user.id,
        req.params.discussionId
    );

    res.status(204).send();
});

export const deleteReplyController = asyncHandler(async (req: Request, res: Response) => {
    await deleteReply(
        req.user.id,
        req.params.replyId
    );

    res.status(204).send();
});