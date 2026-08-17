/*
  Warnings:

  - A unique constraint covering the columns `[selectedCvAnalysisId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CvAnalysisStatus" AS ENUM ('PROCESSING', 'READY', 'AI_FAILED', 'COMPILE_FAILED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "selectedCvAnalysisId" TEXT;

-- CreateTable
CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvAnalysis" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "status" "CvAnalysisStatus" NOT NULL DEFAULT 'PROCESSING',
    "model" TEXT NOT NULL,
    "summaryEs" TEXT,
    "recommendations" JSONB,
    "derivedSource" TEXT,
    "compiledPdfFile" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeVersion_sha256_key" ON "ResumeVersion"("sha256");

-- CreateIndex
CREATE INDEX "ResumeVersion_createdAt_idx" ON "ResumeVersion"("createdAt");

-- CreateIndex
CREATE INDEX "CvAnalysis_applicationId_createdAt_idx" ON "CvAnalysis"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "CvAnalysis_resumeVersionId_idx" ON "CvAnalysis"("resumeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_selectedCvAnalysisId_key" ON "Application"("selectedCvAnalysisId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_selectedCvAnalysisId_fkey" FOREIGN KEY ("selectedCvAnalysisId") REFERENCES "CvAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAnalysis" ADD CONSTRAINT "CvAnalysis_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAnalysis" ADD CONSTRAINT "CvAnalysis_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
