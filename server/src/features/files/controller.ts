import type { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import { getFiles, uploadFile, renameFile, deleteFile } from "./service.js";
import {
    renameFileSchema,
    getFilesQuerySchema,
} from "./validator.js";
import { BadRequestError } from "../../utils/errors/index.js";

export const uploadFileHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new BadRequestError("File is required.");
    }

    const file = await uploadFile(
        req.params!.workspaceId as string,
        req.user!.id,
        req.file,
    );

    res.status(201).json(file);
});

export const getFilesHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = getFilesQuerySchema.parse(
        req.query,
    );

    const result = await getFiles(
        req.params!.workspaceId as string,
        req.user!.id,
        query,
    );

    res.json(result);
});

export const renameFileHandler = asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const body = renameFileSchema.parse(
        req.body,
    );

    const file = await renameFile(
        req.params!.workspaceId as string,
        fileId as string,
        req.user!.id,
        body.displayName,
    );

    res.json(file);
});

export const deleteFileHandler = asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    await deleteFile(
        req.params!.workspaceId as string,
        fileId as string,
        req.user!.id,
    );

    res.status(204).send();
});