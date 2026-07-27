import type { Request, Response } from "express";

import { getFiles, uploadFile, renameFile, deleteFile } from "./file.service.js";

import {
    renameFileSchema,
    getFilesQuerySchema,
} from "./file.validation.js";
import { BadRequestError } from "../../shared/errors/index.js";

export async function uploadFileHandler(
    req: Request,
    res: Response,
) {
    if (!req.file) {
        throw new BadRequestError("File is required.");
    }

    const file = await uploadFile(
        req.params!.workspaceId,
        req.user.id,
        req.file,
    );

    res.status(201).json(file);
}

export async function getFilesHandler(
    req: Request,
    res: Response,
) {

    const query = getFilesQuerySchema.parse(
        req.query,
    );

    const result = await getFiles(
        req.params!.workspaceId,
        req.user.id,
        query,
    );

    res.json(result);
}

export async function renameFileHandler(
    req: Request,
    res: Response,
) {

    const { fileId } = req.params;

    const body = renameFileSchema.parse(
        req.body,
    );

    const file = await renameFile(
        req.params!.workspaceId,
        fileId,
        req.user.id,
        body.displayName,
    );

    res.json(file);
}

export async function deleteFileHandler(
    req: Request,
    res: Response,
) {

    const { fileId } = req.params;

    await deleteFile(
        req.params!.workspaceId,
        fileId,
        req.user.id,
    );

    res.status(204).send();
}