/*
  Warnings:

  - Added the required column `role_id` to the `organization_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization_members" ADD COLUMN     "role_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
