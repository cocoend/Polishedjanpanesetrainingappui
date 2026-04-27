import { z } from 'zod';
export declare const explanationModelSummarySchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodEnum<["prep", "stepbystep", "scqa"]>;
    nameJa: z.ZodString;
    shortDescription: z.ZodString;
    longDescription: z.ZodString;
    structureLabel: z.ZodString;
    steps: z.ZodArray<z.ZodString, "many">;
    features: z.ZodArray<z.ZodString, "many">;
    suitableFor: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    slug: "prep" | "stepbystep" | "scqa";
    nameJa: string;
    shortDescription: string;
    longDescription: string;
    structureLabel: string;
    steps: string[];
    features: string[];
    suitableFor: string[];
}, {
    id: string;
    slug: "prep" | "stepbystep" | "scqa";
    nameJa: string;
    shortDescription: string;
    longDescription: string;
    structureLabel: string;
    steps: string[];
    features: string[];
    suitableFor: string[];
}>;
export declare const explanationModelDetailSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodEnum<["prep", "stepbystep", "scqa"]>;
    nameJa: z.ZodString;
    shortDescription: z.ZodString;
    longDescription: z.ZodString;
    structureLabel: z.ZodString;
    steps: z.ZodArray<z.ZodString, "many">;
    features: z.ZodArray<z.ZodString, "many">;
    suitableFor: z.ZodArray<z.ZodString, "many">;
} & {
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    slug: "prep" | "stepbystep" | "scqa";
    isActive: boolean;
    nameJa: string;
    shortDescription: string;
    longDescription: string;
    structureLabel: string;
    steps: string[];
    features: string[];
    suitableFor: string[];
}, {
    id: string;
    slug: "prep" | "stepbystep" | "scqa";
    isActive: boolean;
    nameJa: string;
    shortDescription: string;
    longDescription: string;
    structureLabel: string;
    steps: string[];
    features: string[];
    suitableFor: string[];
}>;
export type ExplanationModelSummaryDto = z.infer<typeof explanationModelSummarySchema>;
export type ExplanationModelDetailDto = z.infer<typeof explanationModelDetailSchema>;
