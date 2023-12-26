/*
  Warnings:

  - You are about to drop the column `roles` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "published_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" DROP COLUMN "roles",
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboarded_at" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'WORKER';
