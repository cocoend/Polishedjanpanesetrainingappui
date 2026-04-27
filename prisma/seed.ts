import { PrismaClient } from '../apps/api/src/generated/prisma/client';

import { explanationModels, practiceThemes } from '../apps/api/src/modules/master-data/master-data';

const prisma = new PrismaClient();

async function seedExplanationModels() {
  for (const [index, model] of explanationModels.entries()) {
    await prisma.explanationModel.upsert({
      where: {
        id: model.id,
      },
      update: {
        slug: model.slug,
        nameJa: model.nameJa,
        shortDescription: model.shortDescription,
        longDescription: model.longDescription,
        structureLabel: model.structureLabel,
        steps: model.steps,
        features: model.features,
        suitableFor: model.suitableFor,
        sortOrder: index,
        isActive: model.isActive,
      },
      create: {
        id: model.id,
        slug: model.slug,
        nameJa: model.nameJa,
        shortDescription: model.shortDescription,
        longDescription: model.longDescription,
        structureLabel: model.structureLabel,
        steps: model.steps,
        features: model.features,
        suitableFor: model.suitableFor,
        sortOrder: index,
        isActive: model.isActive,
      },
    });
  }
}

async function seedPracticeThemes() {
  for (const [index, theme] of practiceThemes.entries()) {
    await prisma.practiceTheme.upsert({
      where: {
        id: theme.id,
      },
      update: {
        slug: theme.slug,
        level: theme.level,
        category: theme.category,
        title: theme.title,
        description: theme.description,
        promptText: theme.promptText,
        explanationGoal: theme.explanationGoal,
        recommendedModelId: theme.recommendedModelId,
        keywords: theme.keywords,
        usefulExpressions: theme.usefulExpressions,
        hints: theme.hints,
        estimatedMinutes: theme.estimatedMinutes,
        difficulty: theme.difficulty,
        purposeTags: theme.purposeTags,
        sortOrder: index,
        nextThemeId: null,
        isActive: theme.isActive,
      },
      create: {
        id: theme.id,
        slug: theme.slug,
        level: theme.level,
        category: theme.category,
        title: theme.title,
        description: theme.description,
        promptText: theme.promptText,
        explanationGoal: theme.explanationGoal,
        recommendedModelId: theme.recommendedModelId,
        keywords: theme.keywords,
        usefulExpressions: theme.usefulExpressions,
        hints: theme.hints,
        estimatedMinutes: theme.estimatedMinutes,
        difficulty: theme.difficulty,
        purposeTags: theme.purposeTags,
        sortOrder: index,
        nextThemeId: null,
        isActive: theme.isActive,
      },
    });
  }

  for (const theme of practiceThemes) {
    await prisma.practiceTheme.update({
      where: {
        id: theme.id,
      },
      data: {
        nextThemeId: theme.nextThemeId,
      },
    });
  }
}

async function main() {
  await seedExplanationModels();
  await seedPracticeThemes();

  console.log(
    `Seed completed: ${explanationModels.length} explanation models, ${practiceThemes.length} themes.`,
  );
}

void main()
  .catch((error) => {
    console.error('Seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
