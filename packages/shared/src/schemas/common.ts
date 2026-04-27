import { z } from 'zod';

export const anonymousUserContextSchema = z.object({
  anonymousUserId: z.string().min(1),
});

export const scoreBreakdownSchema = z.object({
  totalScore: z.number().int().min(0).max(100),
  modelFitScore: z.number().int().min(0).max(50),
  topicCoverageScore: z.number().int().min(0).max(10),
  structureScore: z.number().int().min(0).max(5),
  grammarScore: z.number().int().min(0).max(10),
  clarityScore: z.number().int().min(0).max(25),
});
