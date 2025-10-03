/*
  Warnings:

  - You are about to drop the column `quiz` on the `Content` table. All the data in the column will be lost.
  - Changed the type of `grades` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "quiz",
DROP COLUMN "grades",
ADD COLUMN     "grades" INTEGER NOT NULL;
