/*
  Warnings:

  - You are about to drop the column `image` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Content` table. All the data in the column will be lost.
  - Added the required column `title` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `description` on table `Content` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('VIDEO', 'DOCUMENT', 'QUIZ');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "image",
DROP COLUMN "url",
DROP COLUMN "video",
ADD COLUMN     "allowComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "body" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'INTERMEDIATE',
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "grades" INTEGER[],
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "quiz" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "videoUrl" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."ContentType" NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
