/*
  Warnings:

  - You are about to drop the column `project_id` on the `invitations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_project_id_fkey";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "project_id";
