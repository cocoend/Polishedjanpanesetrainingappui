"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreBreakdownSchema = exports.anonymousUserContextSchema = void 0;
const zod_1 = require("zod");
exports.anonymousUserContextSchema = zod_1.z.object({
    anonymousUserId: zod_1.z.string().min(1),
});
exports.scoreBreakdownSchema = zod_1.z.object({
    totalScore: zod_1.z.number().int().min(0).max(100),
    modelFitScore: zod_1.z.number().int().min(0).max(50),
    topicCoverageScore: zod_1.z.number().int().min(0).max(10),
    structureScore: zod_1.z.number().int().min(0).max(5),
    grammarScore: zod_1.z.number().int().min(0).max(10),
    clarityScore: zod_1.z.number().int().min(0).max(25),
});
//# sourceMappingURL=common.js.map