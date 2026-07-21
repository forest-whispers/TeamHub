/*
  Warnings:

  - You are about to drop the column `selectedText` on the `DocumentDiscussion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentDiscussion" DROP COLUMN "selectedText",
ADD COLUMN     "quotedText" TEXT;
