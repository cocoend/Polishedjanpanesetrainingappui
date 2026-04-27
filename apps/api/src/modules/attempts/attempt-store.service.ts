import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { PrismaService } from '../prisma/prisma.service';
import { SessionStoreService } from '../sessions/session-store.service';

export interface StoredAttempt {
  id: string;
  sessionId: string;
  attemptIndex: number;
  audioStorageKey?: string | null;
  audioMimeType: string;
  audioDurationSec: number;
  audioFileSizeBytes: number;
  transcriptText: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  submittedAt: string;
}

const MAX_AUDIO_DURATION_SEC = 10 * 60;
const MAX_AUDIO_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_AUDIO_MIME_TYPES = new Set(['audio/webm', 'video/webm']);

@Injectable()
export class AttemptStoreService {
  private readonly attempts = new Map<string, StoredAttempt>();

  constructor(
    private readonly sessionStore: SessionStoreService,
    private readonly prismaService: PrismaService,
  ) {}

  async createAttempt(input: {
    sessionId: string;
    transcriptText: string;
    audioMimeType: string;
    audioDurationSec: number;
    audioFileSizeBytes: number;
    audioStorageKey?: string | null;
    transcriptionStatus?: StoredAttempt['transcriptionStatus'];
    transcriptionProvider?: string | null;
    transcriptionModel?: string | null;
  }): Promise<StoredAttempt> {
    const session = await this.sessionStore.getSessionById(input.sessionId);
    this.validateAttemptInput(input);
    const prisma = await this.prismaService.getOptionalClient();
    const resolvedTranscriptionStatus = input.transcriptionStatus ?? 'completed';
    const nextSessionStatus = resolvedTranscriptionStatus === 'completed' ? 'transcribed' : 'uploaded';

    if (!prisma) {
      return this.createInMemoryAttempt(input.sessionId, input, session.id, nextSessionStatus);
    }

    try {
      const attemptDelegate = prisma.answerAttempt as {
        count: (args: { where: Record<string, unknown> }) => Promise<number>;
        create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
      };
      const attemptIndex =
        (await attemptDelegate.count({
          where: {
            sessionId: session.id,
          },
        })) + 1;
      const created = await attemptDelegate.create({
        data: {
          id: randomUUID(),
          sessionId: session.id,
          attemptIndex,
          audioStorageKey: input.audioStorageKey ?? null,
          audioMimeType: input.audioMimeType,
          audioDurationSec: input.audioDurationSec,
          audioFileSizeBytes: input.audioFileSizeBytes,
          transcriptText: input.transcriptText,
          transcriptLanguage: 'ja',
          transcriptionStatus: resolvedTranscriptionStatus,
          transcriptionProvider: input.transcriptionProvider ?? 'prototype',
          transcriptionModel: input.transcriptionModel ?? 'prototype-sync',
        },
      });

      await this.sessionStore.attachLatestAttempt(
        session.id,
        String(created.id),
        nextSessionStatus,
      );
      return this.mapPrismaAttempt(created);
    } catch {
      return this.createInMemoryAttempt(input.sessionId, input, session.id, nextSessionStatus);
    }
  }

  async createUploadedAttempt(input: {
    sessionId: string;
    transcriptText?: string;
    audioDurationSec: number;
    file: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname?: string;
    };
  }): Promise<StoredAttempt> {
    const upload = input.file;
    const fileExtension = this.getUploadFileExtension(upload.originalname, upload.mimetype);
    const fileName = `${randomUUID()}.${fileExtension}`;
    const storageDirectory = join(process.cwd(), 'uploads', 'attempt-audio');
    const absoluteFilePath = join(storageDirectory, fileName);

    await mkdir(storageDirectory, { recursive: true });
    await writeFile(absoluteFilePath, upload.buffer);

    return this.createAttempt({
      sessionId: input.sessionId,
      transcriptText: input.transcriptText?.trim() ?? '',
      audioMimeType: upload.mimetype,
      audioDurationSec: input.audioDurationSec,
      audioFileSizeBytes: upload.size,
      audioStorageKey: join('attempt-audio', fileName),
      transcriptionStatus: input.transcriptText?.trim() ? 'completed' : 'pending',
      transcriptionProvider: input.transcriptText?.trim() ? 'client-transcript' : null,
      transcriptionModel: input.transcriptText?.trim() ? 'client-transcript' : null,
    });
  }

  async listAttemptsBySessionId(sessionId: string): Promise<StoredAttempt[]> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.listInMemoryAttemptsBySessionId(sessionId);
    }

    try {
      const attemptDelegate = prisma.answerAttempt as {
        findMany: (args: {
          where: Record<string, unknown>;
          orderBy: Array<Record<string, 'asc' | 'desc'>>;
        }) => Promise<Array<Record<string, unknown>>>;
      };
      const attempts = await attemptDelegate.findMany({
        where: {
          sessionId,
        },
        orderBy: [{ attemptIndex: 'asc' }],
      });

      return attempts.map((attempt) => this.mapPrismaAttempt(attempt));
    } catch {
      return this.listInMemoryAttemptsBySessionId(sessionId);
    }
  }

  async getAttemptById(attemptId: string): Promise<StoredAttempt> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.getInMemoryAttemptById(attemptId);
    }

    try {
      const attemptDelegate = prisma.answerAttempt as {
        findUnique: (args: {
          where: Record<string, unknown>;
        }) => Promise<Record<string, unknown> | null>;
      };
      const attempt = await attemptDelegate.findUnique({
        where: {
          id: attemptId,
        },
      });

      if (!attempt) {
        throw new NotFoundException(`Attempt "${attemptId}" was not found.`);
      }

      return this.mapPrismaAttempt(attempt);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      return this.getInMemoryAttemptById(attemptId);
    }
  }

  async completeAttemptTranscription(input: {
    attemptId: string;
    transcriptText: string;
    transcriptionProvider: string;
    transcriptionModel: string;
  }): Promise<StoredAttempt> {
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      return this.completeInMemoryAttemptTranscription(input);
    }

    try {
      const attemptDelegate = prisma.answerAttempt as {
        update: (args: {
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }) => Promise<Record<string, unknown>>;
      };
      const updated = await attemptDelegate.update({
        where: {
          id: input.attemptId,
        },
        data: {
          transcriptText: input.transcriptText,
          transcriptionStatus: 'completed',
          transcriptionProvider: input.transcriptionProvider,
          transcriptionModel: input.transcriptionModel,
        },
      });
      const mappedAttempt = this.mapPrismaAttempt(updated);
      await this.sessionStore.attachLatestAttempt(mappedAttempt.sessionId, mappedAttempt.id, 'transcribed');
      return mappedAttempt;
    } catch {
      return this.completeInMemoryAttemptTranscription(input);
    }
  }

  private async createInMemoryAttempt(
    sessionId: string,
    input: {
      transcriptText: string;
      audioMimeType: string;
      audioDurationSec: number;
      audioFileSizeBytes: number;
      audioStorageKey?: string | null;
      transcriptionStatus?: StoredAttempt['transcriptionStatus'];
    },
    resolvedSessionId: string,
    nextSessionStatus: 'uploaded' | 'transcribed',
  ): Promise<StoredAttempt> {
    const attemptIndex = this.listInMemoryAttemptsBySessionId(sessionId).length + 1;
    const submittedAt = new Date().toISOString();
    const attempt: StoredAttempt = {
      id: randomUUID(),
      sessionId: resolvedSessionId,
      attemptIndex,
      audioStorageKey: input.audioStorageKey ?? null,
      audioMimeType: input.audioMimeType,
      audioDurationSec: input.audioDurationSec,
      audioFileSizeBytes: input.audioFileSizeBytes,
      transcriptText: input.transcriptText,
      transcriptionStatus: input.transcriptionStatus ?? 'completed',
      submittedAt,
    };

    this.attempts.set(attempt.id, attempt);
    await this.sessionStore.attachLatestAttempt(resolvedSessionId, attempt.id, nextSessionStatus);

    return attempt;
  }

  private listInMemoryAttemptsBySessionId(sessionId: string): StoredAttempt[] {
    return Array.from(this.attempts.values())
      .filter((attempt) => attempt.sessionId === sessionId)
      .sort((a, b) => a.attemptIndex - b.attemptIndex);
  }

  private getInMemoryAttemptById(attemptId: string): StoredAttempt {
    const attempt = this.attempts.get(attemptId);

    if (!attempt) {
      throw new NotFoundException(`Attempt "${attemptId}" was not found.`);
    }

    return attempt;
  }

  private async completeInMemoryAttemptTranscription(input: {
    attemptId: string;
    transcriptText: string;
  }): Promise<StoredAttempt> {
    const attempt = this.getInMemoryAttemptById(input.attemptId);
    const nextAttempt: StoredAttempt = {
      ...attempt,
      transcriptText: input.transcriptText,
      transcriptionStatus: 'completed',
    };

    this.attempts.set(attempt.id, nextAttempt);
    await this.sessionStore.attachLatestAttempt(nextAttempt.sessionId, nextAttempt.id, 'transcribed');
    return nextAttempt;
  }

  private mapPrismaAttempt(attempt: Record<string, unknown>): StoredAttempt {
    return {
      id: String(attempt.id),
      sessionId: String(attempt.sessionId),
      attemptIndex: Number(attempt.attemptIndex),
      audioStorageKey: attempt.audioStorageKey ? String(attempt.audioStorageKey) : null,
      audioMimeType: String(attempt.audioMimeType),
      audioDurationSec: Number(attempt.audioDurationSec),
      audioFileSizeBytes: Number(attempt.audioFileSizeBytes),
      transcriptText: String(attempt.transcriptText ?? ''),
      transcriptionStatus: String(attempt.transcriptionStatus) as StoredAttempt['transcriptionStatus'],
      submittedAt: this.toIsoString(attempt.submittedAt),
    };
  }

  private toIsoString(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private validateAttemptInput(input: {
    transcriptText: string;
    audioMimeType: string;
    audioDurationSec: number;
    audioFileSizeBytes: number;
  }) {
    if (!input.audioMimeType || !ALLOWED_AUDIO_MIME_TYPES.has(input.audioMimeType)) {
      throw new BadRequestException('Only webm audio uploads are supported for now.');
    }

    if (input.audioDurationSec < 0 || input.audioDurationSec > MAX_AUDIO_DURATION_SEC) {
      throw new BadRequestException('Audio duration must be 10 minutes or less.');
    }

    if (
      input.audioFileSizeBytes < 0 ||
      input.audioFileSizeBytes > MAX_AUDIO_FILE_SIZE_BYTES
    ) {
      throw new BadRequestException('Audio file size must be 10MB or less.');
    }
  }

  private getUploadFileExtension(originalName: string | undefined, mimeType: string) {
    const originalExtension = originalName?.split('.').pop()?.toLowerCase();

    if (originalExtension === 'webm') {
      return originalExtension;
    }

    if (mimeType === 'audio/webm' || mimeType === 'video/webm') {
      return 'webm';
    }

    return 'bin';
  }
}
