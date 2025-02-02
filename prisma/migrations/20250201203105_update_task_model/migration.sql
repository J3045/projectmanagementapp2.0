/*
  Warnings:

  - The values [NOT_STARTED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TaskPriority" ADD VALUE 'URGENT';

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED');
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Task_projectId_status_priority_idx" ON "Task"("projectId", "status", "priority");

-- CreateIndex
CREATE INDEX "Team_teamName_idx" ON "Team"("teamName");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
