-- CreateTable
CREATE TABLE "DocumentDiscussion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "anchor" JSONB NOT NULL,
    "selectedText" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentDiscussionReply" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentDiscussionReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentDiscussion_documentId_idx" ON "DocumentDiscussion"("documentId");

-- CreateIndex
CREATE INDEX "DocumentDiscussion_documentId_resolved_idx" ON "DocumentDiscussion"("documentId", "resolved");

-- CreateIndex
CREATE INDEX "DocumentDiscussionReply_discussionId_idx" ON "DocumentDiscussionReply"("discussionId");

-- AddForeignKey
ALTER TABLE "DocumentDiscussion" ADD CONSTRAINT "DocumentDiscussion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDiscussion" ADD CONSTRAINT "DocumentDiscussion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDiscussion" ADD CONSTRAINT "DocumentDiscussion_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDiscussionReply" ADD CONSTRAINT "DocumentDiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "DocumentDiscussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentDiscussionReply" ADD CONSTRAINT "DocumentDiscussionReply_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
