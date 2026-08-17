/*
  Warnings:

  - You are about to drop the `AiSuggestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiSuggestion" DROP CONSTRAINT "AiSuggestion_applicationId_fkey";

-- DropTable
DROP TABLE "AiSuggestion";
