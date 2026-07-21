import { Router } from "express";

import { getDiscussionsController, createDiscussionController, replyDiscussionController, resolveDiscussionController, deleteDiscussionController, deleteReplyController } from "./discussion.controller.ts";

const router = Router({ mergeParams: true });

router.get("/", getDiscussionsController);

router.post("/", createDiscussionController);

router.post("/:discussionId/replies", replyDiscussionController);

router.patch("/:discussionId/resolve", resolveDiscussionController);

router.delete("/:discussionId", deleteDiscussionController);

router.delete("/replies/:replyId", deleteReplyController);

export default router;