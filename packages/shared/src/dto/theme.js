"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeDetailResponseSchema = exports.themeDetailSchema = exports.themeListItemSchema = void 0;
const zod_1 = require("zod");
const explanation_model_1 = require("./explanation-model");
exports.themeListItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    slug: zod_1.z.string(),
    level: zod_1.z.string(),
    category: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    estimatedMinutes: zod_1.z.number().int().positive(),
    difficulty: zod_1.z.number().int().min(1).max(5),
    purposeTags: zod_1.z.array(zod_1.z.string()),
    isActive: zod_1.z.boolean(),
});
exports.themeDetailSchema = exports.themeListItemSchema.extend({
    promptText: zod_1.z.string(),
    explanationGoal: zod_1.z.string(),
    recommendedModelId: zod_1.z.string(),
    keywords: zod_1.z.array(zod_1.z.string()),
    usefulExpressions: zod_1.z.array(zod_1.z.string()),
    hints: zod_1.z.array(zod_1.z.string()),
    nextThemeId: zod_1.z.string().nullable(),
});
exports.themeDetailResponseSchema = zod_1.z.object({
    theme: exports.themeDetailSchema,
    recommendedModel: explanation_model_1.explanationModelSummarySchema,
});
//# sourceMappingURL=theme.js.map