import path from "path";

import { Prisma, WorkspaceRole } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

import { eventBus } from "../../infrastructure/events/event-bus.js";

import { ForbiddenError, NotFoundError } from "../../shared/errors/index.js";

import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../shared/utils/uploadToCloudinary.js";

import type { GetFilesQuery } from "./file.types.js";
import { ensureWorkspaceMember, ensureWorkspaceOwner } from "../../shared/authorization/workspace.js";

export async function uploadFile(
    workspaceId: string,
    uploadedById: string,
    file: Express.Multer.File,
) {
    await ensureWorkspaceMember(uploadedById, workspaceId);

    const uploaded = await uploadFileToCloudinary(
        file,
        workspaceId,
    );

    const extension = path.extname(file.originalname).replace(".", "") || null;

    const created = await prisma.file.create({
        data: {

            workspaceId,

            uploadedById,

            originalName: file.originalname,

            displayName: file.originalname,

            storageKey: uploaded.public_id,

            url: uploaded.secure_url,

            mimeType: file.mimetype,

            extension,

            size: file.size,

        },

        include: {
            uploadedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });

    eventBus.emit("file.created", {
        workspaceId,
        actorId: uploadedById,

        fileId: created.id,

        displayName: created.displayName,
        originalName: created.originalName,

        size: created.size,
    });

    return created;
}

export async function getFiles(
    workspaceId: string,
    requesterId: string,
    query: GetFilesQuery,
) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    const {
        cursor,
        limit = 20,

        search,
        mimeType,
        uploadedBy,

        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const where: Prisma.FileWhereInput = {

        workspaceId,

        ...(search && {
            OR: [
                {
                    displayName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    originalName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),

        ...(mimeType && { mimeType }),

        ...(uploadedBy && {
            uploadedById: uploadedBy,
        }),

    };

    const files = await prisma.file.findMany({

        where,

        orderBy: {
            [sortBy]: sortOrder,
        },

        cursor: cursor
            ? { id: cursor }
            : undefined,

        skip: cursor ? 1 : 0,

        take: limit + 1,

        include: {
            uploadedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });

    let nextCursor: string | undefined;

    if (files.length > limit) {
        nextCursor = files[limit]!.id;
        files.pop();
    }

    return {
        files,
        nextCursor,
    };
}

export async function renameFile(
    workspaceId: string,
    fileId: string,
    actorId: string,
    displayName: string,
) {
    await ensureWorkspaceMember(actorId, workspaceId);

    const file = await prisma.file.findUnique({
        where: {
            id: fileId,
        },
    });

    if (!file) {
        throw new NotFoundError("File not found.");
    }

    if (file.uploadedById !== actorId) {
        throw new ForbiddenError(
            "You can only rename your own files.",
        );
    }

    const updated = await prisma.file.update({

        where: {
            id: fileId,
        },

        data: {
            displayName,
        },

        include: {
            uploadedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },

    });

    eventBus.emit("file.renamed", {

        workspaceId: updated.workspaceId,

        actorId,

        fileId: updated.id,

        oldDisplayName: file.displayName,

        newDisplayName: updated.displayName,

    });

    return updated;
}

export async function deleteFile(
    workspaceId: string,
    fileId: string,
    actorId: string,
) {

    const file = await prisma.file.findUnique({

        where: {
            id: fileId,
        },

        include: {
            workspace: {
                include: {
                    members: {
                        where: {
                            userId: actorId,
                        },
                    },
                },
            },
        },

    });

    if (!file) {
        throw new NotFoundError("File not found.");
    }

    const membership = file.workspace.members[0];

    const isOwner = file.uploadedById === actorId;

    const isAdmin = membership?.role === WorkspaceRole.OWNER || membership?.role === WorkspaceRole.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new ForbiddenError("You do not have permission to delete this file.",);
    }

    let resourceType: "image" | "video" | "raw" = "raw";
    if (file.mimeType.startsWith("image/")) {
        resourceType = "image";
    } else if (file.mimeType.startsWith("video/") || file.mimeType.startsWith("audio/")) {
        resourceType = "video";
    }

    await deleteFileFromCloudinary(
        file.storageKey,
        resourceType,
    );

    await prisma.file.delete({
        where: {
            id: file.id,
        },
    });

    eventBus.emit("file.deleted", {

        workspaceId: file.workspaceId,

        actorId,

        fileId: file.id,

        displayName: file.displayName,

    });
}