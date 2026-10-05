import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { createDocument, getDocuments, getDocument, updateDocument, saveDocument, deleteDocument } from "./service.js";

export const createDocumentController = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await createDocument(req.user!.id, req.params.workspaceId as string, req.body));
});

export const getDocumentsController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await getDocuments(req.user!.id, req.params.workspaceId as string));
});

export const getDocumentController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await getDocument(req.user!.id, req.params.workspaceId as string, req.params.documentId as string));
});

export const updateDocumentController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await updateDocument(req.user!.id, req.params.workspaceId as string, req.params.documentId as string, req.body));
});

export async function saveDocumentController(req: Request, res: Response) {

    const document = await saveDocument( req.user!.id, req.params.workspaceId as string, req.params.documentId as string, req.body);

    res.json(document);
  }

export const deleteDocumentController = asyncHandler(async (req: Request, res: Response) => {
    await deleteDocument(req.user!.id, req.params.workspaceId as string, req.params.documentId as string);

    res.sendStatus(204);
});