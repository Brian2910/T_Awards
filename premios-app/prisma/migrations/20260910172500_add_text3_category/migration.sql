-- AlterEnum
ALTER TYPE "CategoryType" ADD VALUE 'TEXT3';

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "textAnswer2" TEXT,
ADD COLUMN     "textAnswer3" TEXT;
