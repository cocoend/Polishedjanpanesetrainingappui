import { z } from 'zod';
export declare const createSessionSchema: z.ZodObject<{
    themeId: z.ZodString;
    selectedModelId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    themeId: string;
    selectedModelId: string;
}, {
    themeId: string;
    selectedModelId: string;
}>;
export declare const practiceSessionSchema: z.ZodObject<{
    id: z.ZodString;
    themeId: z.ZodString;
    selectedModelId: z.ZodString;
    status: z.ZodEnum<["draft", "recording", "uploaded", "transcribed", "feedback_ready", "completed", "abandoned"]>;
    latestAttemptId: z.ZodNullable<z.ZodString>;
    completionThreshold: z.ZodNumber;
    startedAt: z.ZodString;
    completedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    themeId: string;
    selectedModelId: string;
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    id: string;
    latestAttemptId: string | null;
    completionThreshold: number;
    startedAt: string;
    completedAt: string | null;
}, {
    themeId: string;
    selectedModelId: string;
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    id: string;
    latestAttemptId: string | null;
    completionThreshold: number;
    startedAt: string;
    completedAt: string | null;
}>;
export declare const practiceSessionDetailSchema: z.ZodObject<{
    id: z.ZodString;
    themeId: z.ZodString;
    selectedModelId: z.ZodString;
    status: z.ZodEnum<["draft", "recording", "uploaded", "transcribed", "feedback_ready", "completed", "abandoned"]>;
    latestAttemptId: z.ZodNullable<z.ZodString>;
    completionThreshold: z.ZodNumber;
    startedAt: z.ZodString;
    completedAt: z.ZodNullable<z.ZodString>;
} & {
    anonymousUserId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    themeId: string;
    selectedModelId: string;
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    id: string;
    latestAttemptId: string | null;
    completionThreshold: number;
    startedAt: string;
    completedAt: string | null;
    anonymousUserId: string;
    createdAt: string;
    updatedAt: string;
}, {
    themeId: string;
    selectedModelId: string;
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    id: string;
    latestAttemptId: string | null;
    completionThreshold: number;
    startedAt: string;
    completedAt: string | null;
    anonymousUserId: string;
    createdAt: string;
    updatedAt: string;
}>;
export declare const latestUnfinishedSessionSchema: z.ZodObject<{
    session: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        themeId: z.ZodString;
        selectedModelId: z.ZodString;
        status: z.ZodEnum<["draft", "recording", "uploaded", "transcribed", "feedback_ready", "completed", "abandoned"]>;
        latestAttemptId: z.ZodNullable<z.ZodString>;
        completionThreshold: z.ZodNumber;
        startedAt: z.ZodString;
        completedAt: z.ZodNullable<z.ZodString>;
    } & {
        anonymousUserId: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        themeId: string;
        selectedModelId: string;
        status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
        id: string;
        latestAttemptId: string | null;
        completionThreshold: number;
        startedAt: string;
        completedAt: string | null;
        anonymousUserId: string;
        createdAt: string;
        updatedAt: string;
    }, {
        themeId: string;
        selectedModelId: string;
        status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
        id: string;
        latestAttemptId: string | null;
        completionThreshold: number;
        startedAt: string;
        completedAt: string | null;
        anonymousUserId: string;
        createdAt: string;
        updatedAt: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    session: {
        themeId: string;
        selectedModelId: string;
        status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
        id: string;
        latestAttemptId: string | null;
        completionThreshold: number;
        startedAt: string;
        completedAt: string | null;
        anonymousUserId: string;
        createdAt: string;
        updatedAt: string;
    } | null;
}, {
    session: {
        themeId: string;
        selectedModelId: string;
        status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
        id: string;
        latestAttemptId: string | null;
        completionThreshold: number;
        startedAt: string;
        completedAt: string | null;
        anonymousUserId: string;
        createdAt: string;
        updatedAt: string;
    } | null;
}>;
export declare const updateSessionStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["draft", "recording", "uploaded", "transcribed", "feedback_ready", "completed", "abandoned"]>;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    completedAt?: string | null | undefined;
}, {
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    completedAt?: string | null | undefined;
}>;
export declare const createSessionResponseSchema: z.ZodObject<{
    id: z.ZodString;
    themeId: z.ZodString;
    selectedModelId: z.ZodString;
    status: z.ZodEnum<["draft", "recording", "uploaded", "transcribed", "feedback_ready", "completed", "abandoned"]>;
    latestAttemptId: z.ZodNullable<z.ZodString>;
    startedAt: z.ZodString;
    completedAt: z.ZodNullable<z.ZodString>;
    anonymousUserId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    completionThreshold: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    themeId: string;
    selectedModelId: string;
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    id: string;
    latestAttemptId: string | null;
    completionThreshold: number;
    startedAt: string;
    completedAt: string | null;
    anonymousUserId: string;
    createdAt: string;
    updatedAt: string;
}, {
    themeId: string;
    selectedModelId: string;
    status: "draft" | "recording" | "uploaded" | "transcribed" | "feedback_ready" | "completed" | "abandoned";
    id: string;
    latestAttemptId: string | null;
    startedAt: string;
    completedAt: string | null;
    anonymousUserId: string;
    createdAt: string;
    updatedAt: string;
    completionThreshold?: number | undefined;
}>;
export declare const attemptSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    attemptIndex: z.ZodNumber;
    audioMimeType: z.ZodString;
    audioDurationSec: z.ZodNumber;
    audioFileSizeBytes: z.ZodNumber;
    transcriptText: z.ZodDefault<z.ZodString>;
    transcriptionStatus: z.ZodEnum<["pending", "processing", "completed", "failed"]>;
    submittedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sessionId: string;
    attemptIndex: number;
    audioMimeType: string;
    audioDurationSec: number;
    audioFileSizeBytes: number;
    transcriptText: string;
    transcriptionStatus: "completed" | "pending" | "processing" | "failed";
    submittedAt: string;
}, {
    id: string;
    sessionId: string;
    attemptIndex: number;
    audioMimeType: string;
    audioDurationSec: number;
    audioFileSizeBytes: number;
    transcriptionStatus: "completed" | "pending" | "processing" | "failed";
    submittedAt: string;
    transcriptText?: string | undefined;
}>;
export declare const feedbackSchema: z.ZodObject<{
    totalScore: z.ZodNumber;
    modelFitScore: z.ZodNumber;
    topicCoverageScore: z.ZodNumber;
    structureScore: z.ZodNumber;
    grammarScore: z.ZodNumber;
    clarityScore: z.ZodNumber;
} & {
    id: z.ZodString;
    sessionId: z.ZodString;
    attemptId: z.ZodString;
    strengths: z.ZodArray<z.ZodString, "many">;
    improvementPoints: z.ZodArray<z.ZodString, "many">;
    retryFocusPoints: z.ZodArray<z.ZodString, "many">;
    improvedAnswerExample: z.ZodString;
    recommendReason: z.ZodNullable<z.ZodString>;
    isPerfectScore: z.ZodBoolean;
    completionThresholdSnapshot: z.ZodNumber;
    aiProvider: z.ZodString;
    aiModel: z.ZodString;
    promptVersion: z.ZodString;
    rubricVersion: z.ZodString;
    generationStatus: z.ZodEnum<["pending", "processing", "completed", "failed"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    sessionId: string;
    totalScore: number;
    modelFitScore: number;
    topicCoverageScore: number;
    structureScore: number;
    grammarScore: number;
    clarityScore: number;
    attemptId: string;
    strengths: string[];
    improvementPoints: string[];
    retryFocusPoints: string[];
    improvedAnswerExample: string;
    recommendReason: string | null;
    isPerfectScore: boolean;
    completionThresholdSnapshot: number;
    aiProvider: string;
    aiModel: string;
    promptVersion: string;
    rubricVersion: string;
    generationStatus: "completed" | "pending" | "processing" | "failed";
}, {
    id: string;
    createdAt: string;
    sessionId: string;
    totalScore: number;
    modelFitScore: number;
    topicCoverageScore: number;
    structureScore: number;
    grammarScore: number;
    clarityScore: number;
    attemptId: string;
    strengths: string[];
    improvementPoints: string[];
    retryFocusPoints: string[];
    improvedAnswerExample: string;
    recommendReason: string | null;
    isPerfectScore: boolean;
    completionThresholdSnapshot: number;
    aiProvider: string;
    aiModel: string;
    promptVersion: string;
    rubricVersion: string;
    generationStatus: "completed" | "pending" | "processing" | "failed";
}>;
export declare const retryContextSchema: z.ZodObject<{
    sessionId: z.ZodString;
    previousAttemptId: z.ZodString;
    previousTranscriptText: z.ZodString;
    previousFeedbackId: z.ZodString;
    previousScore: z.ZodNumber;
    focusPoints: z.ZodArray<z.ZodString, "many">;
    conciseExamples: z.ZodArray<z.ZodString, "many">;
    selectedModelId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    selectedModelId: string;
    sessionId: string;
    previousAttemptId: string;
    previousTranscriptText: string;
    previousFeedbackId: string;
    previousScore: number;
    focusPoints: string[];
    conciseExamples: string[];
}, {
    selectedModelId: string;
    sessionId: string;
    previousAttemptId: string;
    previousTranscriptText: string;
    previousFeedbackId: string;
    previousScore: number;
    focusPoints: string[];
    conciseExamples: string[];
}>;
export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type PracticeSessionDto = z.infer<typeof practiceSessionSchema>;
export type PracticeSessionDetailDto = z.infer<typeof practiceSessionDetailSchema>;
export type LatestUnfinishedSessionDto = z.infer<typeof latestUnfinishedSessionSchema>;
export type UpdateSessionStatusDto = z.infer<typeof updateSessionStatusSchema>;
export type CreateSessionResponseDto = z.infer<typeof createSessionResponseSchema>;
export type AttemptDto = z.infer<typeof attemptSchema>;
export type FeedbackDto = z.infer<typeof feedbackSchema>;
export type RetryContextDto = z.infer<typeof retryContextSchema>;
