/*
  Warnings:

  - You are about to drop the column `owner_id` on the `organizations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_owner_id_fkey";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "owner_id";
