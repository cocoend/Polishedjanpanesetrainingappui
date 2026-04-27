import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { findExplanationModelByIdOrSlug } from '../master-data/master-data';
import { PrismaService } from '../prisma/prisma.service';

type SessionStatus =
  | 'draft'
  | 'recording'
  | 'uploaded'
  | 'transcribed'
  | 'feedback_ready'
  | 'completed'
  | 'abandoned';

export interface StoredSession {
  id: string;
  anonymousUserId: string;
  themeId: string;
  selectedModelId: string;
  status: SessionStatus;
  latestAttemptId: string | null;
  completionThreshold: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const COMPLETION_THRESHOLD_DEFAULT = 100;

@Injectable()
export class SessionStoreService {
  private readonly sessions = new Map<string, StoredSession>();

  constructor(private readonly prismaService: PrismaService) {}

  async createSession(input: {
    anonymousUserId: string;
    themeId: string;
    selectedModelId: string;
  }): Promise<StoredSession> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.createInMemorySession(input);
    }

    try {
      const user = await this.ensureAnonymousUser(prisma, input.anonymousUserId);
      const persistedSelectedModelId =
        findExplanationModelByIdOrSlug(input.selectedModelId)?.id ?? input.selectedModelId;
      const sessionDelegate = prisma.practiceSession as {
        create: (args: {
          data: Record<string, unknown>;
          include: Record<string, boolean>;
        }) => Promise<Record<string, unknown>>;
      };
      const created = await sessionDelegate.create({
        data: {
          id: randomUUID(),
          userId: String(user.id),
          themeId: input.themeId,
          selectedModelId: persistedSelectedModelId,
          status: 'draft',
          latestAttemptId: null,
          completionThreshold: COMPLETION_THRESHOLD_DEFAULT,
        },
        include: {
          user: true,
          selectedModel: true,
        },
      });

      return this.mapPrismaSession(created);
    } catch {
      return this.createInMemorySession(input);
    }
  }

  async getSessionById(sessionId: string): Promise<StoredSession> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.getInMemorySessionById(sessionId);
    }

    try {
      const sessionDelegate = prisma.practiceSession as {
        findUnique: (args: {
          where: Record<string, unknown>;
          include: Record<string, boolean>;
        }) => Promise<Record<string, unknown> | null>;
      };
      const session = await sessionDelegate.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          user: true,
          selectedModel: true,
        },
      });

      if (!session) {
        throw new NotFoundException(`Session "${sessionId}" was not found.`);
      }

      return this.mapPrismaSession(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      return this.getInMemorySessionById(sessionId);
    }
  }

  async updateSessionStatus(
    sessionId: string,
    input: { status: SessionStatus; completedAt?: string | null },
  ): Promise<StoredSession> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.updateInMemorySessionStatus(sessionId, input);
    }

    try {
      const sessionDelegate = prisma.practiceSession as {
        update: (args: {
          where: Record<string, unknown>;
          data: Record<string, unknown>;
          include: Record<string, boolean>;
        }) => Promise<Record<string, unknown>>;
      };
      const updatedAt = new Date().toISOString();
      const updated = await sessionDelegate.update({
        where: {
          id: sessionId,
        },
        data: {
          status: input.status,
          completedAt:
            input.completedAt !== undefined
              ? input.completedAt
              : input.status === 'completed'
                ? updatedAt
                : undefined,
        },
        include: {
          user: true,
          selectedModel: true,
        },
      });

      return this.mapPrismaSession(updated);
    } catch {
      return this.updateInMemorySessionStatus(sessionId, input);
    }
  }

  async getLatestUnfinishedSession(anonymousUserId: string): Promise<StoredSession | null> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.getLatestUnfinishedInMemorySession(anonymousUserId);
    }

    try {
      const user = await this.findAnonymousUser(prisma, anonymousUserId);

      if (!user) {
        return null;
      }

      const sessionDelegate = prisma.practiceSession as {
        findFirst: (args: {
          where: Record<string, unknown>;
          orderBy: Array<Record<string, 'asc' | 'desc'>>;
          include: Record<string, boolean>;
        }) => Promise<Record<string, unknown> | null>;
      };
      const session = await sessionDelegate.findFirst({
        where: {
          userId: String(user.id),
          status: {
            in: ['draft', 'recording', 'uploaded', 'transcribed', 'feedback_ready'],
          },
        },
        orderBy: [{ updatedAt: 'desc' }],
        include: {
          user: true,
          selectedModel: true,
        },
      });

      return session ? this.mapPrismaSession(session) : null;
    } catch {
      return this.getLatestUnfinishedInMemorySession(anonymousUserId);
    }
  }

  async listSessionsByAnonymousUserId(anonymousUserId: string): Promise<StoredSession[]> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.listInMemorySessionsByAnonymousUserId(anonymousUserId);
    }

    try {
      const user = await this.findAnonymousUser(prisma, anonymousUserId);

      if (!user) {
        return [];
      }

      const sessionDelegate = prisma.practiceSession as {
        findMany: (args: {
          where: Record<string, unknown>;
          orderBy: Array<Record<string, 'asc' | 'desc'>>;
          include: Record<string, boolean>;
        }) => Promise<Array<Record<string, unknown>>>;
      };
      const sessions = await sessionDelegate.findMany({
        where: {
          userId: String(user.id),
        },
        orderBy: [{ updatedAt: 'desc' }],
        include: {
          user: true,
          selectedModel: true,
        },
      });

      return sessions.map((session) => this.mapPrismaSession(session));
    } catch {
      return this.listInMemorySessionsByAnonymousUserId(anonymousUserId);
    }
  }

  async attachLatestAttempt(
    sessionId: string,
    latestAttemptId: string,
    status: 'uploaded' | 'transcribed' | 'feedback_ready',
  ): Promise<StoredSession> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.attachInMemoryLatestAttempt(sessionId, latestAttemptId, status);
    }

    try {
      const sessionDelegate = prisma.practiceSession as {
        update: (args: {
          where: Record<string, unknown>;
          data: Record<string, unknown>;
          include: Record<string, boolean>;
        }) => Promise<Record<string, unknown>>;
      };
      const updated = await sessionDelegate.update({
        where: {
          id: sessionId,
        },
        data: {
          latestAttemptId,
          status,
        },
        include: {
          user: true,
          selectedModel: true,
        },
      });

      return this.mapPrismaSession(updated);
    } catch {
      return this.attachInMemoryLatestAttempt(sessionId, latestAttemptId, status);
    }
  }

  private createInMemorySession(input: {
    anonymousUserId: string;
    themeId: string;
    selectedModelId: string;
  }): StoredSession {
    const now = new Date().toISOString();
    const session: StoredSession = {
      id: randomUUID(),
      anonymousUserId: input.anonymousUserId,
      themeId: input.themeId,
      selectedModelId: input.selectedModelId,
      status: 'draft',
      latestAttemptId: null,
      completionThreshold: COMPLETION_THRESHOLD_DEFAULT,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  private getInMemorySessionById(sessionId: string): StoredSession {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException(`Session "${sessionId}" was not found.`);
    }

    return session;
  }

  private updateInMemorySessionStatus(
    sessionId: string,
    input: { status: SessionStatus; completedAt?: string | null },
  ): StoredSession {
    const session = this.getInMemorySessionById(sessionId);
    const updatedAt = new Date().toISOString();

    const nextSession: StoredSession = {
      ...session,
      status: input.status,
      completedAt:
        input.completedAt !== undefined
          ? input.completedAt
          : input.status === 'completed'
            ? updatedAt
            : session.completedAt,
      updatedAt,
    };

    this.sessions.set(sessionId, nextSession);
    return nextSession;
  }

  private getLatestUnfinishedInMemorySession(anonymousUserId: string): StoredSession | null {
    const unfinishedStatuses: SessionStatus[] = [
      'draft',
      'recording',
      'uploaded',
      'transcribed',
      'feedback_ready',
    ];

    const sessions = Array.from(this.sessions.values())
      .filter(
        (session) =>
          session.anonymousUserId === anonymousUserId &&
          unfinishedStatuses.includes(session.status),
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

    return sessions[0] ?? null;
  }

  private listInMemorySessionsByAnonymousUserId(anonymousUserId: string): StoredSession[] {
    return Array.from(this.sessions.values())
      .filter((session) => session.anonymousUserId === anonymousUserId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  private attachInMemoryLatestAttempt(
    sessionId: string,
    latestAttemptId: string,
    status: 'uploaded' | 'transcribed' | 'feedback_ready',
  ): StoredSession {
    const session = this.getInMemorySessionById(sessionId);
    const updatedAt = new Date().toISOString();

    const nextSession: StoredSession = {
      ...session,
      latestAttemptId,
      status,
      updatedAt,
    };

    this.sessions.set(sessionId, nextSession);
    return nextSession;
  }

  private async ensureAnonymousUser(
    prisma: { [key: string]: unknown },
    anonymousUserId: string,
  ): Promise<Record<string, unknown>> {
    const userDelegate = prisma.user as {
      upsert: (args: {
        where: Record<string, unknown>;
        update: Record<string, unknown>;
        create: Record<string, unknown>;
      }) => Promise<Record<string, unknown>>;
    };

    return userDelegate.upsert({
      where: {
        anonymousUserId,
      },
      update: {
        lastActiveAt: new Date().toISOString(),
      },
      create: {
        id: randomUUID(),
        anonymousUserId,
        userType: 'anonymous',
      },
    });
  }

  private async findAnonymousUser(
    prisma: { [key: string]: unknown },
    anonymousUserId: string,
  ): Promise<Record<string, unknown> | null> {
    const userDelegate = prisma.user as {
      findUnique: (args: {
        where: Record<string, unknown>;
      }) => Promise<Record<string, unknown> | null>;
    };

    return userDelegate.findUnique({
      where: {
        anonymousUserId,
      },
    });
  }

  private mapPrismaSession(session: Record<string, unknown>): StoredSession {
    const user = session.user as Record<string, unknown> | undefined;
    const selectedModel = session.selectedModel as Record<string, unknown> | undefined;

    return {
      id: String(session.id),
      anonymousUserId: user ? String(user.anonymousUserId) : '',
      themeId: String(session.themeId),
      selectedModelId: selectedModel?.slug ? String(selectedModel.slug) : String(session.selectedModelId),
      status: String(session.status) as SessionStatus,
      latestAttemptId: session.latestAttemptId ? String(session.latestAttemptId) : null,
      completionThreshold: Number(session.completionThreshold),
      startedAt: this.toIsoString(session.startedAt),
      completedAt: session.completedAt ? this.toIsoString(session.completedAt) : null,
      createdAt: this.toIsoString(session.createdAt),
      updatedAt: this.toIsoString(session.updatedAt),
    };
  }

  private toIsoString(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }
}
