import { z } from 'zod';

import { explanationModelSummarySchema } from './explanation-model';

export const themeListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  level: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().int().positive(),
  difficulty: z.number().int().min(1).max(5),
  purposeTags: z.array(z.string()),
  isActive: z.boolean(),
});

export const themeDetailSchema = themeListItemSchema.extend({
  promptText: z.string(),
  explanationGoal: z.string(),
  recommendedModelId: z.string(),
  keywords: z.array(z.string()),
  usefulExpressions: z.array(z.string()),
  hints: z.array(z.string()),
  nextThemeId: z.string().nullable(),
});

export const themeDetailResponseSchema = z.object({
  theme: themeDetailSchema,
  recommendedModel: explanationModelSummarySchema,
});

export type ThemeListItemDto = z.infer<typeof themeListItemSchema>;
export type ThemeDetailDto = z.infer<typeof themeDetailSchema>;
export type ThemeDetailResponseDto = z.infer<typeof themeDetailResponseSchema>;
