import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { createDocumentController, getDocumentsController, getDocumentController, updateDocumentController, deleteDocumentController } from "./document.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", createDocumentController);

router.get("/", getDocumentsController);

router.get("/:documentId", getDocumentController);

router.patch("/:documentId", updateDocumentController);

router.delete("/:documentId", deleteDocumentController);

export default router;