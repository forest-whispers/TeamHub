-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DOCUMENT', 'MEETING_NOTES', 'PRESENTATION');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "type" "DocumentType" NOT NULL DEFAULT 'DOCUMENT';
