import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import snapshotRoutes from "./snapshot/routes.js";
import discussionRoutes from "./discussion/routes.js";
import { createDocumentController, getDocumentsController, getDocumentController, updateDocumentController, saveDocumentController, deleteDocumentController } from "./controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", validate(validator.createDocumentSchema), createDocumentController);

router.get("/", getDocumentsController);

router.get("/:documentId", getDocumentController);

router.patch("/:documentId", validate(validator.updateDocumentSchema), updateDocumentController);

router.patch("/:documentId/content", validate(validator.saveDocumentValidator), saveDocumentController);

router.use("/:documentId/history", snapshotRoutes);

router.use("/:documentId/discussions", discussionRoutes);

router.delete("/:documentId", deleteDocumentController);

export default router;