"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.learnedCardSchema = void 0;
const zod_1 = require("zod");
exports.learnedCardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sessionId: zod_1.z.string(),
    feedbackId: zod_1.z.string(),
    themeId: zod_1.z.string(),
    title: zod_1.z.string(),
    summary: zod_1.z.string(),
    keyTakeaways: zod_1.z.array(zod_1.z.string()),
    examplePhrases: zod_1.z.array(zod_1.z.string()),
    latestScore: zod_1.z.number().int().min(0).max(100),
    bestScore: zod_1.z.number().int().min(0).max(100),
    attemptCount: zod_1.z.number().int().positive(),
    isRead: zod_1.z.boolean(),
    savedAt: zod_1.z.string(),
    readAt: zod_1.z.string().nullable(),
});
//# sourceMappingURL=learned-card.js.map