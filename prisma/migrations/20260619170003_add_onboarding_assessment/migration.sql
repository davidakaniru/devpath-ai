-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "OnboardingAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerGoal" "CareerGoal" NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "OnboardingAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingQuestion" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctOption" TEXT NOT NULL,
    "userAnswer" TEXT,
    "confidence" "ConfidenceLevel",
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "OnboardingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "overallLevel" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidenceProfile" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "categoryScores" JSONB NOT NULL,
    "recommendedPath" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingResult_assessmentId_key" ON "OnboardingResult"("assessmentId");

-- AddForeignKey
ALTER TABLE "OnboardingAssessment" ADD CONSTRAINT "OnboardingAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingQuestion" ADD CONSTRAINT "OnboardingQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "OnboardingAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingResult" ADD CONSTRAINT "OnboardingResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "OnboardingAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
