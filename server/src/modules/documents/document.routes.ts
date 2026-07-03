import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { createDocumentController, getDocumentsController, getDocumentController, updateDocumentController, updateDocumentContentController, deleteDocumentController } from "./document.controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./document.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", validate(validator.createDocumentSchema), createDocumentController);

router.get("/", getDocumentsController);

router.get("/:documentId", getDocumentController);

router.patch("/:documentId", validate(validator.updateDocumentSchema), updateDocumentController);

router.patch("/:documentId/content", validate(validator.updateDocumentContentValidator), updateDocumentContentController);

router.delete("/:documentId", deleteDocumentController);

export default router;