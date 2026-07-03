import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { createDocument, getDocuments, getDocument, updateDocument, updateDocumentContent, deleteDocument } from "./document.service.js";

export const createDocumentController = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await createDocument(req.user!.id, req.params.workspaceId, req.body));
});

export const getDocumentsController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await getDocuments(req.user!.id, req.params.workspaceId));
});

export const getDocumentController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await getDocument(req.user!.id, req.params.workspaceId, req.params.documentId));
});

export const updateDocumentController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await updateDocument(req.user!.id, req.params.workspaceId, req.params.documentId, req.body));
});

export async function updateDocumentContentController(req: Request, res: Response) {

    const document = await updateDocumentContent( req.user!.id, req.params.workspaceId, req.params.documentId, req.body.content);

    res.json(document);
  }

export const deleteDocumentController = asyncHandler(async (req: Request, res: Response) => {
    await deleteDocument(req.user!.id, req.params.workspaceId, req.params.documentId);

    res.sendStatus(204);
});