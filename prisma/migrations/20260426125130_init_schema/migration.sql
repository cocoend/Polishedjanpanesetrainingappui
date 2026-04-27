-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('anonymous', 'registered');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('draft', 'recording', 'uploaded', 'transcribed', 'feedback_ready', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "anonymousUserId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'anonymous',
    "registeredUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeTheme" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "explanationGoal" TEXT NOT NULL,
    "recommendedModelId" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "usefulExpressions" JSONB NOT NULL,
    "hints" JSONB NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "purposeTags" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "nextThemeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExplanationModel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "structureLabel" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "suitableFor" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExplanationModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "selectedModelId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'draft',
    "latestAttemptId" TEXT,
    "completionThreshold" INTEGER NOT NULL DEFAULT 100,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerAttempt" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "attemptIndex" INTEGER NOT NULL,
    "audioStorageKey" TEXT,
    "audioMimeType" TEXT NOT NULL,
    "audioDurationSec" INTEGER NOT NULL,
    "audioFileSizeBytes" INTEGER NOT NULL,
    "transcriptText" TEXT NOT NULL DEFAULT '',
    "transcriptLanguage" TEXT NOT NULL DEFAULT 'ja',
    "transcriptionProvider" TEXT,
    "transcriptionModel" TEXT,
    "transcriptionStatus" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "modelFitScore" INTEGER NOT NULL,
    "topicCoverageScore" INTEGER NOT NULL,
    "structureScore" INTEGER NOT NULL,
    "grammarScore" INTEGER NOT NULL,
    "clarityScore" INTEGER NOT NULL,
    "strengths" JSONB NOT NULL,
    "improvementPoints" JSONB NOT NULL,
    "retryFocusPoints" JSONB NOT NULL,
    "improvedAnswerExample" TEXT NOT NULL,
    "recommendReason" TEXT,
    "isPerfectScore" BOOLEAN NOT NULL DEFAULT false,
    "completionThresholdSnapshot" INTEGER NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "rubricVersion" TEXT NOT NULL,
    "rawResponseJson" JSONB NOT NULL,
    "generationStatus" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnedCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "themeLevel" TEXT NOT NULL,
    "selectedModelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyTakeaways" JSONB NOT NULL,
    "examplePhrases" JSONB NOT NULL,
    "purposeTags" JSONB NOT NULL,
    "latestScore" INTEGER NOT NULL,
    "bestScore" INTEGER NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "improvementFromFirstScore" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnedCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_anonymousUserId_key" ON "User"("anonymousUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeTheme_slug_key" ON "PracticeTheme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExplanationModel_slug_key" ON "ExplanationModel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSession_latestAttemptId_key" ON "PracticeSession"("latestAttemptId");

-- CreateIndex
CREATE INDEX "PracticeSession_userId_status_idx" ON "PracticeSession"("userId", "status");

-- CreateIndex
CREATE INDEX "PracticeSession_themeId_idx" ON "PracticeSession"("themeId");

-- CreateIndex
CREATE INDEX "AnswerAttempt_sessionId_submittedAt_idx" ON "AnswerAttempt"("sessionId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerAttempt_sessionId_attemptIndex_key" ON "AnswerAttempt"("sessionId", "attemptIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_attemptId_key" ON "Feedback"("attemptId");

-- CreateIndex
CREATE INDEX "Feedback_sessionId_createdAt_idx" ON "Feedback"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "LearnedCard_userId_savedAt_idx" ON "LearnedCard"("userId", "savedAt");

-- CreateIndex
CREATE INDEX "LearnedCard_userId_isRead_idx" ON "LearnedCard"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "PracticeTheme" ADD CONSTRAINT "PracticeTheme_recommendedModelId_fkey" FOREIGN KEY ("recommendedModelId") REFERENCES "ExplanationModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeTheme" ADD CONSTRAINT "PracticeTheme_nextThemeId_fkey" FOREIGN KEY ("nextThemeId") REFERENCES "PracticeTheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "PracticeTheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_selectedModelId_fkey" FOREIGN KEY ("selectedModelId") REFERENCES "ExplanationModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_latestAttemptId_fkey" FOREIGN KEY ("latestAttemptId") REFERENCES "AnswerAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerAttempt" ADD CONSTRAINT "AnswerAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AnswerAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnedCard" ADD CONSTRAINT "LearnedCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnedCard" ADD CONSTRAINT "LearnedCard_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnedCard" ADD CONSTRAINT "LearnedCard_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnedCard" ADD CONSTRAINT "LearnedCard_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "PracticeTheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
