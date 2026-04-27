import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  type ExplanationModelRecord,
  type ExplanationModelSummaryRecord,
  findExplanationModelByIdOrSlug,
  findThemeByIdOrSlug,
  getExplanationModelSummaries,
  getThemeList,
  type PracticeThemeRecord,
} from './master-data';

type ThemeListFilters = {
  level?: string;
  category?: string;
};

@Injectable()
export class MasterDataService {
  constructor(private readonly prismaService: PrismaService) {}

  async listThemes(filters?: ThemeListFilters) {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return getThemeList(filters);
    }

    try {
      const themeDelegate = prisma.practiceTheme as {
        findMany: (input: {
          where: Record<string, unknown>;
          orderBy: Array<Record<string, 'asc' | 'desc'>>;
        }) => Promise<Array<Record<string, unknown>>>;
      };
      const themes = await themeDelegate.findMany({
        where: {
          isActive: true,
          ...(filters?.level ? { level: filters.level } : {}),
          ...(filters?.category && filters.category !== 'all'
            ? { category: filters.category }
            : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      return themes.map((theme: Record<string, unknown>) => ({
        id: String(theme.id),
        slug: String(theme.slug),
        level: String(theme.level),
        category: String(theme.category),
        title: String(theme.title),
        description: String(theme.description),
        estimatedMinutes: Number(theme.estimatedMinutes),
        difficulty: Number(theme.difficulty),
        purposeTags: this.toStringArray(theme.purposeTags),
        isActive: Boolean(theme.isActive),
      }));
    } catch {
      return getThemeList(filters);
    }
  }

  async getThemeByIdOrSlug(themeId: string): Promise<PracticeThemeRecord | undefined> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return findThemeByIdOrSlug(themeId);
    }

    try {
      const themeDelegate = prisma.practiceTheme as {
        findFirst: (input: {
          where: Record<string, unknown>;
        }) => Promise<Record<string, unknown> | null>;
      };
      const theme = await themeDelegate.findFirst({
        where: {
          OR: [{ id: themeId }, { slug: themeId }],
        },
      });

      if (!theme) {
        return undefined;
      }

      return {
        id: String(theme.id),
        slug: String(theme.slug),
        level: String(theme.level),
        category: String(theme.category),
        title: String(theme.title),
        description: String(theme.description),
        promptText: String(theme.promptText),
        explanationGoal: String(theme.explanationGoal),
        recommendedModelId: String(theme.recommendedModelId),
        keywords: this.toStringArray(theme.keywords),
        usefulExpressions: this.toStringArray(theme.usefulExpressions),
        hints: this.toStringArray(theme.hints),
        estimatedMinutes: Number(theme.estimatedMinutes),
        difficulty: Number(theme.difficulty),
        purposeTags: this.toStringArray(theme.purposeTags),
        nextThemeId: theme.nextThemeId ? String(theme.nextThemeId) : null,
        isActive: Boolean(theme.isActive),
      };
    } catch {
      return findThemeByIdOrSlug(themeId);
    }
  }

  async listExplanationModels(): Promise<ExplanationModelSummaryRecord[]> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return getExplanationModelSummaries();
    }

    try {
      const modelDelegate = prisma.explanationModel as {
        findMany: (input: {
          where: Record<string, unknown>;
          orderBy: Array<Record<string, 'asc' | 'desc'>>;
        }) => Promise<Array<Record<string, unknown>>>;
      };
      const models = await modelDelegate.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      return models.map((model: Record<string, unknown>) => ({
        id: String(model.id),
        slug: this.toModelSlug(String(model.slug)),
        nameJa: String(model.nameJa),
        shortDescription: String(model.shortDescription),
        longDescription: String(model.longDescription),
        structureLabel: String(model.structureLabel),
        steps: this.toStringArray(model.steps),
        features: this.toStringArray(model.features),
        suitableFor: this.toStringArray(model.suitableFor),
      }));
    } catch {
      return getExplanationModelSummaries();
    }
  }

  async getExplanationModelByIdOrSlug(modelId: string): Promise<ExplanationModelRecord | undefined> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return findExplanationModelByIdOrSlug(modelId);
    }

    try {
      const modelDelegate = prisma.explanationModel as {
        findFirst: (input: {
          where: Record<string, unknown>;
        }) => Promise<Record<string, unknown> | null>;
      };
      const model = await modelDelegate.findFirst({
        where: {
          OR: [{ id: modelId }, { slug: modelId }],
        },
      });

      if (!model) {
        return undefined;
      }

      return {
        id: String(model.id),
        slug: this.toModelSlug(String(model.slug)),
        nameJa: String(model.nameJa),
        shortDescription: String(model.shortDescription),
        longDescription: String(model.longDescription),
        structureLabel: String(model.structureLabel),
        steps: this.toStringArray(model.steps),
        features: this.toStringArray(model.features),
        suitableFor: this.toStringArray(model.suitableFor),
        isActive: Boolean(model.isActive),
      };
    } catch {
      return findExplanationModelByIdOrSlug(modelId);
    }
  }

  private toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }

  private toModelSlug(value: string): 'prep' | 'stepbystep' | 'scqa' {
    if (value === 'prep' || value === 'stepbystep' || value === 'scqa') {
      return value;
    }

    return 'prep';
  }
}
