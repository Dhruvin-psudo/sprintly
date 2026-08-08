/*
  Warnings:

  - Made the column `due_date` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET NOT NULL;
