import { z } from 'zod';

export const explanationModelSummarySchema = z.object({
  id: z.string(),
  slug: z.enum(['prep', 'stepbystep', 'scqa']),
  nameJa: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  structureLabel: z.string(),
  steps: z.array(z.string()),
  features: z.array(z.string()),
  suitableFor: z.array(z.string()),
});

export const explanationModelDetailSchema = explanationModelSummarySchema.extend({
  isActive: z.boolean(),
});

export type ExplanationModelSummaryDto = z.infer<typeof explanationModelSummarySchema>;
export type ExplanationModelDetailDto = z.infer<typeof explanationModelDetailSchema>;
