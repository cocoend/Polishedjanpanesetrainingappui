import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { AttemptStoreService } from '../attempts/attempt-store.service';
import { FeedbackStoreService } from '../feedback/feedback-store.service';
import { LearnedCardsService } from '../learned-cards/learned-cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStoreService } from '../sessions/session-store.service';

export interface DeleteAnonymousUserDataResult {
  success: true;
  anonymousUserId: string;
  deletedSessions: number;
  deletedAttempts: number;
  deletedFeedback: number;
  deletedLearnedCards: number;
  deletedUsers: number;
}

@Injectable()
export class UserDataService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionStore: SessionStoreService,
    private readonly attemptStore: AttemptStoreService,
    private readonly feedbackStore: FeedbackStoreService,
    private readonly learnedCardsService: LearnedCardsService,
  ) {}

  async deleteAnonymousUserData(anonymousUserId: string): Promise<DeleteAnonymousUserDataResult> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.deleteInMemoryAnonymousUserData(anonymousUserId);
    }

    try {
      const userDelegate = prisma.user as {
        findUnique: (args: {
          where: Record<string, unknown>;
        }) => Promise<Record<string, unknown> | null>;
        delete: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown>>;
      };
      const sessionDelegate = prisma.practiceSession as {
        findMany: (args: {
          where: Record<string, unknown>;
          select: Record<string, boolean>;
        }) => Promise<Array<Record<string, unknown>>>;
        updateMany: (args: {
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }) => Promise<{ count: number }>;
        deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
      };
      const attemptDelegate = prisma.answerAttempt as {
        deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
      };
      const feedbackDelegate = prisma.feedback as {
        deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
      };
      const learnedCardDelegate = prisma.learnedCard as {
        deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
      };

      const user = await userDelegate.findUnique({
        where: {
          anonymousUserId,
        },
      });

      if (!user) {
        this.deleteInMemoryAnonymousUserData(anonymousUserId);
        return this.emptyResult(anonymousUserId);
      }

      const userId = String(user.id);
      const sessions = await sessionDelegate.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });
      const sessionIds = sessions.map((session) => String(session.id));
      const sessionWhere = {
        sessionId: {
          in: sessionIds,
        },
      };

      const deletedLearnedCards = await learnedCardDelegate.deleteMany({
        where: {
          userId,
        },
      });
      const deletedFeedback = await feedbackDelegate.deleteMany({
        where: sessionWhere,
      });
      await sessionDelegate.updateMany({
        where: {
          id: {
            in: sessionIds,
          },
        },
        data: {
          latestAttemptId: null,
        },
      });
      const deletedAttempts = await attemptDelegate.deleteMany({
        where: sessionWhere,
      });
      const deletedSessions = await sessionDelegate.deleteMany({
        where: {
          userId,
        },
      });
      await userDelegate.delete({
        where: {
          id: userId,
        },
      });
      this.deleteInMemoryAnonymousUserData(anonymousUserId);

      return {
        success: true,
        anonymousUserId,
        deletedSessions: deletedSessions.count,
        deletedAttempts: deletedAttempts.count,
        deletedFeedback: deletedFeedback.count,
        deletedLearnedCards: deletedLearnedCards.count,
        deletedUsers: 1,
      };
    } catch {
      throw new InternalServerErrorException('Failed to delete anonymous user data.');
    }
  }

  private deleteInMemoryAnonymousUserData(anonymousUserId: string): DeleteAnonymousUserDataResult {
    const { deletedSessions, sessionIds } =
      this.sessionStore.deleteInMemorySessionsByAnonymousUserId(anonymousUserId);
    const { deletedAttempts } = this.attemptStore.deleteInMemoryAttemptsBySessionIds(sessionIds);
    const { deletedFeedback } = this.feedbackStore.deleteInMemoryFeedbackBySessionIds(sessionIds);
    const { deletedLearnedCards } =
      this.learnedCardsService.deleteInMemoryCardsByAnonymousUserId(anonymousUserId);

    return {
      success: true,
      anonymousUserId,
      deletedSessions,
      deletedAttempts,
      deletedFeedback,
      deletedLearnedCards,
      deletedUsers: 0,
    };
  }

  private emptyResult(anonymousUserId: string): DeleteAnonymousUserDataResult {
    return {
      success: true,
      anonymousUserId,
      deletedSessions: 0,
      deletedAttempts: 0,
      deletedFeedback: 0,
      deletedLearnedCards: 0,
      deletedUsers: 0,
    };
  }
}
