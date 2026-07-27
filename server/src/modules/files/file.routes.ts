import { Router } from "express";

import { upload } from "../../config/multer.js";

import {
    uploadFileHandler,
    getFilesHandler,
    renameFileHandler,
    deleteFileHandler,
} from "./file.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
    "/",
    getFilesHandler,
);

router.post(
    "/",
    upload.single("file"),
    uploadFileHandler,
);

router.patch(
    "/:fileId",
    renameFileHandler,
);

router.delete(
    "/:fileId",
    deleteFileHandler,
);

export default router;