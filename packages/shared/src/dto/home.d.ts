import { z } from 'zod';
export declare const homeResponseSchema: z.ZodObject<{
    latestScore: z.ZodNullable<z.ZodNumber>;
    shouldContinueCurrentTheme: z.ZodBoolean;
    recommendReason: z.ZodString;
    completionThreshold: z.ZodNumber;
    recommendedTheme: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        level: z.ZodString;
        category: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        estimatedMinutes: z.ZodNumber;
        difficulty: z.ZodNumber;
        purposeTags: z.ZodArray<z.ZodString, "many">;
        isActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        title: string;
        slug: string;
        level: string;
        category: string;
        estimatedMinutes: number;
        difficulty: number;
        purposeTags: string[];
        isActive: boolean;
    }, {
        id: string;
        description: string;
        title: string;
        slug: string;
        level: string;
        category: string;
        estimatedMinutes: number;
        difficulty: number;
        purposeTags: string[];
        isActive: boolean;
    }>>;
    continueSessionId: z.ZodNullable<z.ZodString>;
    weakPoints: z.ZodArray<z.ZodString, "many">;
    streakDays: z.ZodNumber;
    unreadLearnedCardCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    completionThreshold: number;
    recommendReason: string;
    latestScore: number | null;
    shouldContinueCurrentTheme: boolean;
    recommendedTheme: {
        id: string;
        description: string;
        title: string;
        slug: string;
        level: string;
        category: string;
        estimatedMinutes: number;
        difficulty: number;
        purposeTags: string[];
        isActive: boolean;
    } | null;
    continueSessionId: string | null;
    weakPoints: string[];
    streakDays: number;
    unreadLearnedCardCount: number;
}, {
    completionThreshold: number;
    recommendReason: string;
    latestScore: number | null;
    shouldContinueCurrentTheme: boolean;
    recommendedTheme: {
        id: string;
        description: string;
        title: string;
        slug: string;
        level: string;
        category: string;
        estimatedMinutes: number;
        difficulty: number;
        purposeTags: string[];
        isActive: boolean;
    } | null;
    continueSessionId: string | null;
    weakPoints: string[];
    streakDays: number;
    unreadLearnedCardCount: number;
}>;
export type HomeResponseDto = z.infer<typeof homeResponseSchema>;
