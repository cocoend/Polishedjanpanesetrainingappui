import { z } from 'zod';
export declare const anonymousUserContextSchema: z.ZodObject<{
    anonymousUserId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    anonymousUserId: string;
}, {
    anonymousUserId: string;
}>;
export declare const scoreBreakdownSchema: z.ZodObject<{
    totalScore: z.ZodNumber;
    modelFitScore: z.ZodNumber;
    topicCoverageScore: z.ZodNumber;
    structureScore: z.ZodNumber;
    grammarScore: z.ZodNumber;
    clarityScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalScore: number;
    modelFitScore: number;
    topicCoverageScore: number;
    structureScore: number;
    grammarScore: number;
    clarityScore: number;
}, {
    totalScore: number;
    modelFitScore: number;
    topicCoverageScore: number;
    structureScore: number;
    grammarScore: number;
    clarityScore: number;
}>;
