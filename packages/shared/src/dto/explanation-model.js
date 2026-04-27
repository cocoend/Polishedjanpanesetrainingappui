"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explanationModelDetailSchema = exports.explanationModelSummarySchema = void 0;
const zod_1 = require("zod");
exports.explanationModelSummarySchema = zod_1.z.object({
    id: zod_1.z.string(),
    slug: zod_1.z.enum(['prep', 'stepbystep', 'scqa']),
    nameJa: zod_1.z.string(),
    shortDescription: zod_1.z.string(),
    longDescription: zod_1.z.string(),
    structureLabel: zod_1.z.string(),
    steps: zod_1.z.array(zod_1.z.string()),
    features: zod_1.z.array(zod_1.z.string()),
    suitableFor: zod_1.z.array(zod_1.z.string()),
});
exports.explanationModelDetailSchema = exports.explanationModelSummarySchema.extend({
    isActive: zod_1.z.boolean(),
});
//# sourceMappingURL=explanation-model.js.map