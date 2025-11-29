/*
  Warnings:

  - You are about to drop the column `gradeQuality` on the `projects` table. All the data in the column will be lost.
  - Added the required column `name` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "gradeQuality",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "profitShare" INTEGER,
ADD COLUMN     "volumeDecimal" INTEGER NOT NULL DEFAULT 18;
