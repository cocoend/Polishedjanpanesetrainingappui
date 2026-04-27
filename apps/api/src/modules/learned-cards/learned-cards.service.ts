import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { findThemeByIdOrSlug } from '../master-data/master-data';
import { AttemptStoreService } from '../attempts/attempt-store.service';
import { FeedbackStoreService } from '../feedback/feedback-store.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStoreService } from '../sessions/session-store.service';

export interface StoredLearnedCard {
  id: string;
  anonymousUserId: string;
  sessionId: string;
  feedbackId: string;
  themeId: string;
  themeLevel: string;
  selectedModelId: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  examplePhrases: string[];
  purposeTags: string[];
  latestScore: number;
  bestScore: number;
  attemptCount: number;
  improvementFromFirstScore: number;
  isRead: boolean;
  savedAt: string;
  readAt: string | null;
}

@Injectable()
export class LearnedCardsService {
  private readonly cardsById = new Map<string, StoredLearnedCard>();
  private readonly cardIdBySessionId = new Map<string, string>();

  constructor(
    private readonly sessionStore: SessionStoreService,
    private readonly attemptStore: AttemptStoreService,
    private readonly feedbackStore: FeedbackStoreService,
    private readonly prismaService: PrismaService,
  ) {}

  async saveLatestSessionCard(sessionId: string): Promise<StoredLearnedCard> {
    const session = await this.sessionStore.getSessionById(sessionId);
    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const learnedCardDelegate = prisma.learnedCard as {
          findFirst: (args: {
            where: Record<string, unknown>;
            orderBy: Array<Record<string, 'asc' | 'desc'>>;
          }) => Promise<Record<string, unknown> | null>;
          create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
        };
        const existingPersisted = await learnedCardDelegate.findFirst({
          where: {
            sessionId,
          },
          orderBy: [{ savedAt: 'desc' }],
        });

        if (existingPersisted) {
          const mappedCard = this.mapPrismaLearnedCard(existingPersisted, session.anonymousUserId);
          this.cacheCard(mappedCard);
          return mappedCard;
        }
      } catch {
        // Fall through to creation and cache fallback.
      }
    } else {
      const existingCardId = this.cardIdBySessionId.get(sessionId);

      if (existingCardId) {
        return this.getCardById(existingCardId);
      }
    }

    if (!session.latestAttemptId) {
      throw new BadRequestException(`Session "${sessionId}" does not have an attempt to save yet.`);
    }

    const theme = findThemeByIdOrSlug(session.themeId);

    if (!theme) {
      throw new BadRequestException(`Theme "${session.themeId}" is invalid.`);
    }

    const attempts = await this.attemptStore.listAttemptsBySessionId(sessionId);

    if (attempts.length === 0) {
      throw new BadRequestException(`Session "${sessionId}" does not have any attempts to save.`);
    }

    const feedbacks = await Promise.all(
      attempts.map((attempt) => this.feedbackStore.generateFeedback(attempt.id)),
    );
    const latestFeedback =
      feedbacks.find((feedback) => feedback.attemptId === session.latestAttemptId) ??
      feedbacks[feedbacks.length - 1];
    const firstFeedback = feedbacks[0];
    const bestScore = feedbacks.reduce(
      (highestScore, feedback) => Math.max(highestScore, feedback.totalScore),
      latestFeedback.totalScore,
    );
    const savedAt = new Date().toISOString();

    const card: StoredLearnedCard = {
      id: randomUUID(),
      anonymousUserId: session.anonymousUserId,
      sessionId: session.id,
      feedbackId: latestFeedback.id,
      themeId: theme.id,
      themeLevel: theme.level,
      selectedModelId: session.selectedModelId,
      title: theme.title,
      summary: latestFeedback.recommendReason ?? '今回の練習をもとに学習カードを保存しました。',
      keyTakeaways: latestFeedback.retryFocusPoints,
      examplePhrases: [latestFeedback.improvedAnswerExample],
      purposeTags: theme.purposeTags,
      latestScore: latestFeedback.totalScore,
      bestScore,
      attemptCount: attempts.length,
      improvementFromFirstScore: Math.max(0, latestFeedback.totalScore - firstFeedback.totalScore),
      isRead: false,
      savedAt,
      readAt: null,
    };

    if (!prisma) {
      this.cacheCard(card);
      return card;
    }

    try {
      const userDelegate = prisma.user as {
        findUnique: (args: {
          where: Record<string, unknown>;
        }) => Promise<Record<string, unknown> | null>;
      };
      const learnedCardDelegate = prisma.learnedCard as {
        create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
      };
      const user = await userDelegate.findUnique({
        where: {
          anonymousUserId: session.anonymousUserId,
        },
      });

      if (!user) {
        throw new Error('Anonymous user record is missing.');
      }

      const created = await learnedCardDelegate.create({
        data: {
          id: card.id,
          userId: String(user.id),
          sessionId: card.sessionId,
          feedbackId: card.feedbackId,
          themeId: card.themeId,
          themeLevel: card.themeLevel,
          selectedModelId: card.selectedModelId,
          title: card.title,
          summary: card.summary,
          keyTakeaways: card.keyTakeaways,
          examplePhrases: card.examplePhrases,
          purposeTags: card.purposeTags,
          latestScore: card.latestScore,
          bestScore: card.bestScore,
          attemptCount: card.attemptCount,
          improvementFromFirstScore: card.improvementFromFirstScore,
          isRead: false,
          readAt: null,
        },
      });
      const mappedCard = this.mapPrismaLearnedCard(created, session.anonymousUserId);
      this.cacheCard(mappedCard);
      return mappedCard;
    } catch {
      this.cacheCard(card);
      return card;
    }

  }

  async listCardsByAnonymousUserId(anonymousUserId: string): Promise<StoredLearnedCard[]> {
    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const userDelegate = prisma.user as {
          findUnique: (args: {
            where: Record<string, unknown>;
          }) => Promise<Record<string, unknown> | null>;
        };
        const learnedCardDelegate = prisma.learnedCard as {
          findMany: (args: {
            where: Record<string, unknown>;
            orderBy: Array<Record<string, 'asc' | 'desc'>>;
          }) => Promise<Array<Record<string, unknown>>>;
        };
        const user = await userDelegate.findUnique({
          where: {
            anonymousUserId,
          },
        });

        if (!user) {
          return [];
        }

        const cards = await learnedCardDelegate.findMany({
          where: {
            userId: String(user.id),
          },
          orderBy: [{ savedAt: 'desc' }],
        });

        return cards.map((card) => this.mapPrismaLearnedCard(card, anonymousUserId));
      } catch {
        // Fall through to in-memory cache.
      }
    }

    return Array.from(this.cardsById.values())
      .filter((card) => card.anonymousUserId === anonymousUserId)
      .sort((left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt));
  }

  async getCardById(cardId: string): Promise<StoredLearnedCard> {
    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const learnedCardDelegate = prisma.learnedCard as {
          findUnique: (args: {
            where: Record<string, unknown>;
            include: Record<string, boolean>;
          }) => Promise<Record<string, unknown> | null>;
        };
        const card = await learnedCardDelegate.findUnique({
          where: {
            id: cardId,
          },
          include: {
            user: true,
          },
        });

        if (card) {
          const user = card.user as Record<string, unknown> | undefined;
          const mappedCard = this.mapPrismaLearnedCard(
            card,
            user ? String(user.anonymousUserId) : '',
          );
          this.cacheCard(mappedCard);
          return mappedCard;
        }
      } catch {
        // Fall through to in-memory cache.
      }
    }

    const card = this.cardsById.get(cardId);

    if (!card) {
      throw new NotFoundException(`Learned card "${cardId}" was not found.`);
    }

    return card;
  }

  async markAsRead(cardId: string): Promise<StoredLearnedCard> {
    const card = await this.getCardById(cardId);

    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const learnedCardDelegate = prisma.learnedCard as {
          update: (args: {
            where: Record<string, unknown>;
            data: Record<string, unknown>;
            include: Record<string, boolean>;
          }) => Promise<Record<string, unknown>>;
        };
        const updated = await learnedCardDelegate.update({
          where: {
            id: cardId,
          },
          data: {
            isRead: true,
            readAt: card.readAt ?? new Date().toISOString(),
          },
          include: {
            user: true,
          },
        });
        const user = updated.user as Record<string, unknown> | undefined;
        const mappedCard = this.mapPrismaLearnedCard(
          updated,
          user ? String(user.anonymousUserId) : card.anonymousUserId,
        );
        this.cacheCard(mappedCard);
        return mappedCard;
      } catch {
        // Fall through to in-memory cache.
      }
    }

    if (card.isRead) {
      return card;
    }

    const nextCard: StoredLearnedCard = {
      ...card,
      isRead: true,
      readAt: new Date().toISOString(),
    };

    this.cardsById.set(cardId, nextCard);
    return nextCard;
  }

  async deleteCard(cardId: string) {
    const card = await this.getCardById(cardId);
    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const learnedCardDelegate = prisma.learnedCard as {
          delete: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown>>;
        };
        await learnedCardDelegate.delete({
          where: {
            id: cardId,
          },
        });
      } catch {
        // Fall through to in-memory cache cleanup.
      }
    }

    this.cardsById.delete(cardId);
    this.cardIdBySessionId.delete(card.sessionId);

    return {
      success: true,
    };
  }

  private cacheCard(card: StoredLearnedCard) {
    this.cardsById.set(card.id, card);
    this.cardIdBySessionId.set(card.sessionId, card.id);
  }

  private mapPrismaLearnedCard(
    card: Record<string, unknown>,
    anonymousUserId: string,
  ): StoredLearnedCard {
    return {
      id: String(card.id),
      anonymousUserId,
      sessionId: String(card.sessionId),
      feedbackId: String(card.feedbackId),
      themeId: String(card.themeId),
      themeLevel: String(card.themeLevel),
      selectedModelId: String(card.selectedModelId),
      title: String(card.title),
      summary: String(card.summary),
      keyTakeaways: this.toStringArray(card.keyTakeaways),
      examplePhrases: this.toStringArray(card.examplePhrases),
      purposeTags: this.toStringArray(card.purposeTags),
      latestScore: Number(card.latestScore),
      bestScore: Number(card.bestScore),
      attemptCount: Number(card.attemptCount),
      improvementFromFirstScore: Number(card.improvementFromFirstScore),
      isRead: Boolean(card.isRead),
      savedAt: this.toIsoString(card.savedAt),
      readAt: card.readAt ? this.toIsoString(card.readAt) : null,
    };
  }

  private toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.map((item) => String(item)) : [];
  }

  private toIsoString(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }
}
