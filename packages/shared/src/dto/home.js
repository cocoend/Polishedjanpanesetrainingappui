"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeResponseSchema = void 0;
const zod_1 = require("zod");
const theme_1 = require("./theme");
exports.homeResponseSchema = zod_1.z.object({
    latestScore: zod_1.z.number().int().min(0).max(100).nullable(),
    shouldContinueCurrentTheme: zod_1.z.boolean(),
    recommendReason: zod_1.z.string(),
    completionThreshold: zod_1.z.number().int().min(1).max(100),
    recommendedTheme: theme_1.themeListItemSchema.nullable(),
    continueSessionId: zod_1.z.string().nullable(),
    weakPoints: zod_1.z.array(zod_1.z.string()),
    streakDays: zod_1.z.number().int().nonnegative(),
    unreadLearnedCardCount: zod_1.z.number().int().nonnegative(),
});
//# sourceMappingURL=home.js.map