"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryContextSchema = exports.feedbackSchema = exports.attemptSchema = exports.createSessionResponseSchema = exports.updateSessionStatusSchema = exports.latestUnfinishedSessionSchema = exports.practiceSessionDetailSchema = exports.practiceSessionSchema = exports.createSessionSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../schemas/common");
const app_1 = require("../constants/app");
exports.createSessionSchema = zod_1.z.object({
    themeId: zod_1.z.string().min(1),
    selectedModelId: zod_1.z.string().min(1),
});
exports.practiceSessionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    themeId: zod_1.z.string(),
    selectedModelId: zod_1.z.string(),
    status: zod_1.z.enum([
        'draft',
        'recording',
        'uploaded',
        'transcribed',
        'feedback_ready',
        'completed',
        'abandoned',
    ]),
    latestAttemptId: zod_1.z.string().nullable(),
    completionThreshold: zod_1.z.number().int().min(1).max(100),
    startedAt: zod_1.z.string(),
    completedAt: zod_1.z.string().nullable(),
});
exports.practiceSessionDetailSchema = exports.practiceSessionSchema.extend({
    anonymousUserId: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.latestUnfinishedSessionSchema = zod_1.z.object({
    session: exports.practiceSessionDetailSchema.nullable(),
});
exports.updateSessionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'draft',
        'recording',
        'uploaded',
        'transcribed',
        'feedback_ready',
        'completed',
        'abandoned',
    ]),
    completedAt: zod_1.z.string().nullable().optional(),
});
exports.createSessionResponseSchema = exports.practiceSessionDetailSchema.extend({
    completionThreshold: zod_1.z.number().int().min(1).max(100).default(app_1.COMPLETION_THRESHOLD_DEFAULT),
});
exports.attemptSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sessionId: zod_1.z.string(),
    attemptIndex: zod_1.z.number().int().positive(),
    audioMimeType: zod_1.z.string(),
    audioDurationSec: zod_1.z.number().int().nonnegative(),
    audioFileSizeBytes: zod_1.z.number().int().nonnegative(),
    transcriptText: zod_1.z.string().default(''),
    transcriptionStatus: zod_1.z.enum(['pending', 'processing', 'completed', 'failed']),
    submittedAt: zod_1.z.string(),
});
exports.feedbackSchema = common_1.scoreBreakdownSchema.extend({
    id: zod_1.z.string(),
    sessionId: zod_1.z.string(),
    attemptId: zod_1.z.string(),
    strengths: zod_1.z.array(zod_1.z.string()),
    improvementPoints: zod_1.z.array(zod_1.z.string()),
    retryFocusPoints: zod_1.z.array(zod_1.z.string()),
    improvedAnswerExample: zod_1.z.string(),
    recommendReason: zod_1.z.string().nullable(),
    isPerfectScore: zod_1.z.boolean(),
    completionThresholdSnapshot: zod_1.z.number().int().min(1).max(100),
    aiProvider: zod_1.z.string(),
    aiModel: zod_1.z.string(),
    promptVersion: zod_1.z.string(),
    rubricVersion: zod_1.z.string(),
    generationStatus: zod_1.z.enum(['pending', 'processing', 'completed', 'failed']),
    createdAt: zod_1.z.string(),
});
exports.retryContextSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    previousAttemptId: zod_1.z.string(),
    previousTranscriptText: zod_1.z.string(),
    previousFeedbackId: zod_1.z.string(),
    previousScore: zod_1.z.number().int().min(0).max(100),
    focusPoints: zod_1.z.array(zod_1.z.string()),
    conciseExamples: zod_1.z.array(zod_1.z.string()),
    selectedModelId: zod_1.z.string(),
});
//# sourceMappingURL=session.js.map