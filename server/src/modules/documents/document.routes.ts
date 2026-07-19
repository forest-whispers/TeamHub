import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import snapshotRoutes from "./snapshot/snapshot.routes.js";
import { createDocumentController, getDocumentsController, getDocumentController, updateDocumentController, saveDocumentController, deleteDocumentController } from "./document.controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./document.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", validate(validator.createDocumentSchema), createDocumentController);

router.get("/", getDocumentsController);

router.get("/:documentId", getDocumentController);

router.patch("/:documentId", validate(validator.updateDocumentSchema), updateDocumentController);

router.patch("/:documentId/content", validate(validator.saveDocumentValidator), saveDocumentController);

router.use("/:documentId/history", snapshotRoutes);

router.delete("/:documentId", deleteDocumentController);

export default router;