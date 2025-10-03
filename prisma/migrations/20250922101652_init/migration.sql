-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "image" TEXT,
ADD COLUMN     "video" TEXT;

-- DropEnum
DROP TYPE "public"."BookingStatus";
