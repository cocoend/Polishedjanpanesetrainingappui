import { z } from 'zod';

export const learnedCardSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  feedbackId: z.string(),
  themeId: z.string(),
  themeLevel: z.string(),
  selectedModelId: z.string(),
  title: z.string(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
  examplePhrases: z.array(z.string()),
  purposeTags: z.array(z.string()),
  latestScore: z.number().int().min(0).max(100),
  bestScore: z.number().int().min(0).max(100),
  attemptCount: z.number().int().positive(),
  improvementFromFirstScore: z.number().int().min(0).max(100),
  isRead: z.boolean(),
  savedAt: z.string(),
  readAt: z.string().nullable(),
});

export const learnedCardListResponseSchema = z.object({
  cards: z.array(learnedCardSchema),
});

export type LearnedCardDto = z.infer<typeof learnedCardSchema>;
export type LearnedCardListResponseDto = z.infer<typeof learnedCardListResponseSchema>;
