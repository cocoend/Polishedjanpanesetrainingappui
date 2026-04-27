import { z } from 'zod';

import { scoreBreakdownSchema } from '../schemas/common';
import { COMPLETION_THRESHOLD_DEFAULT } from '../constants/app';

export const createSessionSchema = z.object({
  themeId: z.string().min(1),
  selectedModelId: z.string().min(1),
});

export const practiceSessionSchema = z.object({
  id: z.string(),
  themeId: z.string(),
  selectedModelId: z.string(),
  status: z.enum([
    'draft',
    'recording',
    'uploaded',
    'transcribed',
    'feedback_ready',
    'completed',
    'abandoned',
  ]),
  latestAttemptId: z.string().nullable(),
  completionThreshold: z.number().int().min(1).max(100),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const practiceSessionDetailSchema = practiceSessionSchema.extend({
  anonymousUserId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const latestUnfinishedSessionSchema = z.object({
  session: practiceSessionDetailSchema.nullable(),
});

export const updateSessionStatusSchema = z.object({
  status: z.enum([
    'draft',
    'recording',
    'uploaded',
    'transcribed',
    'feedback_ready',
    'completed',
    'abandoned',
  ]),
  completedAt: z.string().nullable().optional(),
});

export const createSessionResponseSchema = practiceSessionDetailSchema.extend({
  completionThreshold: z.number().int().min(1).max(100).default(COMPLETION_THRESHOLD_DEFAULT),
});

export const createAttemptSchema = z.object({
  transcriptText: z.string().min(1),
  audioMimeType: z.string().min(1).default('audio/webm'),
  audioDurationSec: z.number().int().nonnegative().default(0),
  audioFileSizeBytes: z.number().int().nonnegative().default(0),
});

export const attemptSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  attemptIndex: z.number().int().positive(),
  audioMimeType: z.string(),
  audioDurationSec: z.number().int().nonnegative(),
  audioFileSizeBytes: z.number().int().nonnegative(),
  transcriptText: z.string().default(''),
  transcriptionStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  submittedAt: z.string(),
});

export const sessionAttemptsResponseSchema = z.object({
  attempts: z.array(attemptSchema),
});

export const feedbackSchema = scoreBreakdownSchema.extend({
  id: z.string(),
  sessionId: z.string(),
  attemptId: z.string(),
  strengths: z.array(z.string()),
  improvementPoints: z.array(z.string()),
  retryFocusPoints: z.array(z.string()),
  improvedAnswerExample: z.string(),
  recommendReason: z.string().nullable(),
  isPerfectScore: z.boolean(),
  completionThresholdSnapshot: z.number().int().min(1).max(100),
  aiProvider: z.string(),
  aiModel: z.string(),
  promptVersion: z.string(),
  rubricVersion: z.string(),
  generationStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.string(),
});

export const retryContextSchema = z.object({
  sessionId: z.string(),
  previousAttemptId: z.string(),
  previousTranscriptText: z.string(),
  previousFeedbackId: z.string(),
  previousScore: z.number().int().min(0).max(100),
  focusPoints: z.array(z.string()),
  conciseExamples: z.array(z.string()),
  selectedModelId: z.string(),
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type PracticeSessionDto = z.infer<typeof practiceSessionSchema>;
export type PracticeSessionDetailDto = z.infer<typeof practiceSessionDetailSchema>;
export type LatestUnfinishedSessionDto = z.infer<typeof latestUnfinishedSessionSchema>;
export type UpdateSessionStatusDto = z.infer<typeof updateSessionStatusSchema>;
export type CreateSessionResponseDto = z.infer<typeof createSessionResponseSchema>;
export type CreateAttemptDto = z.infer<typeof createAttemptSchema>;
export type AttemptDto = z.infer<typeof attemptSchema>;
export type SessionAttemptsResponseDto = z.infer<typeof sessionAttemptsResponseSchema>;
export type FeedbackDto = z.infer<typeof feedbackSchema>;
export type RetryContextDto = z.infer<typeof retryContextSchema>;
