import { z } from 'zod';

import { themeListItemSchema } from './theme';

export const homeResponseSchema = z.object({
  latestScore: z.number().int().min(0).max(100).nullable(),
  shouldContinueCurrentTheme: z.boolean(),
  recommendReason: z.string(),
  completionThreshold: z.number().int().min(1).max(100),
  recommendedTheme: themeListItemSchema.nullable(),
  continueSessionId: z.string().nullable(),
  continueTheme: themeListItemSchema.nullable(),
  continueSelectedModelId: z.string().nullable(),
  continueProgressPercent: z.number().int().min(0).max(100),
  weakPoints: z.array(z.string()),
  streakDays: z.number().int().nonnegative(),
  unreadLearnedCardCount: z.number().int().nonnegative(),
});

export type HomeResponseDto = z.infer<typeof homeResponseSchema>;
