import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { findThemeByIdOrSlug } from '../master-data/master-data';
import { AttemptStoreService } from '../attempts/attempt-store.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStoreService } from '../sessions/session-store.service';
import { TranscriptionService } from '../transcription/transcription.service';
import {
  FeedbackGenerationService,
  type FeedbackGenerationResult,
} from './feedback-generation.service';

export interface StoredFeedback {
  id: string;
  sessionId: string;
  attemptId: string;
  totalScore: number;
  modelFitScore: number;
  topicCoverageScore: number;
  structureScore: number;
  grammarScore: number;
  clarityScore: number;
  strengths: string[];
  improvementPoints: string[];
  retryFocusPoints: string[];
  improvedAnswerExample: string;
  recommendReason: string | null;
  isPerfectScore: boolean;
  completionThresholdSnapshot: number;
  aiProvider: string;
  aiModel: string;
  promptVersion: string;
  rubricVersion: string;
  generationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

@Injectable()
export class FeedbackStoreService {
  private readonly feedbackByAttemptId = new Map<string, StoredFeedback>();
  private readonly feedbackById = new Map<string, StoredFeedback>();

  constructor(
    private readonly attemptStore: AttemptStoreService,
    private readonly sessionStore: SessionStoreService,
    private readonly prismaService: PrismaService,
    private readonly transcriptionService: TranscriptionService,
    private readonly feedbackGenerationService: FeedbackGenerationService,
  ) {}

  async generateFeedback(attemptId: string): Promise<StoredFeedback> {
    const existing = this.feedbackByAttemptId.get(attemptId);

    if (existing) {
      return existing;
    }

    let attempt = await this.attemptStore.getAttemptById(attemptId);
    const session = await this.sessionStore.getSessionById(attempt.sessionId);
    const theme = findThemeByIdOrSlug(session.themeId);

    if (attempt.transcriptionStatus !== 'completed') {
      const transcription = await this.transcriptionService.transcribeUploadedAttempt({
        themeTitle: theme?.title ?? session.themeId,
        selectedModelId: session.selectedModelId,
        audioStorageKey: attempt.audioStorageKey ?? null,
        audioMimeType: attempt.audioMimeType,
        audioDurationSec: attempt.audioDurationSec,
        audioFileSizeBytes: attempt.audioFileSizeBytes,
      });
      attempt = await this.attemptStore.completeAttemptTranscription({
        attemptId: attempt.id,
        transcriptText: transcription.transcriptText,
        transcriptionProvider: transcription.transcriptionProvider,
        transcriptionModel: transcription.transcriptionModel,
      });
    }

    const generatedFeedback = await this.feedbackGenerationService.generateFeedback({
      attempt,
      session,
      themeKeywords: theme?.keywords ?? [],
    });
    const feedback = this.buildStoredFeedback(attempt, session, generatedFeedback);
    const prisma = await this.prismaService.getOptionalClient();

    if (!prisma) {
      this.cacheFeedback(feedback);
      await this.sessionStore.updateSessionStatus(session.id, {
        status: feedback.isPerfectScore ? 'completed' : 'feedback_ready',
      });
      return feedback;
    }

    try {
      const feedbackDelegate = prisma.feedback as {
        findUnique: (args: {
          where: Record<string, unknown>;
        }) => Promise<Record<string, unknown> | null>;
        create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
      };
      const existingPersisted = await feedbackDelegate.findUnique({
        where: {
          attemptId,
        },
      });

      if (existingPersisted) {
        const mappedExisting = this.mapPrismaFeedback(existingPersisted);
        this.cacheFeedback(mappedExisting);
        return mappedExisting;
      }

      const created = await feedbackDelegate.create({
        data: {
          id: feedback.id,
          attemptId: feedback.attemptId,
          sessionId: feedback.sessionId,
          totalScore: feedback.totalScore,
          modelFitScore: feedback.modelFitScore,
          topicCoverageScore: feedback.topicCoverageScore,
          structureScore: feedback.structureScore,
          grammarScore: feedback.grammarScore,
          clarityScore: feedback.clarityScore,
          strengths: feedback.strengths,
          improvementPoints: feedback.improvementPoints,
          retryFocusPoints: feedback.retryFocusPoints,
          improvedAnswerExample: feedback.improvedAnswerExample,
          recommendReason: feedback.recommendReason,
          isPerfectScore: feedback.isPerfectScore,
          completionThresholdSnapshot: feedback.completionThresholdSnapshot,
          aiProvider: feedback.aiProvider,
          aiModel: feedback.aiModel,
          promptVersion: feedback.promptVersion,
          rubricVersion: feedback.rubricVersion,
          rawResponseJson: generatedFeedback.rawResponseJson,
          generationStatus: feedback.generationStatus,
          errorMessage: null,
        },
      });
      const mappedCreated = this.mapPrismaFeedback(created);
      this.cacheFeedback(mappedCreated);
      await this.sessionStore.updateSessionStatus(session.id, {
        status: mappedCreated.isPerfectScore ? 'completed' : 'feedback_ready',
      });
      return mappedCreated;
    } catch {
      this.cacheFeedback(feedback);
      await this.sessionStore.updateSessionStatus(session.id, {
        status: feedback.isPerfectScore ? 'completed' : 'feedback_ready',
      });
      return feedback;
    }
  }

  async getFeedbackById(feedbackId: string): Promise<StoredFeedback> {
    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const feedbackDelegate = prisma.feedback as {
          findUnique: (args: {
            where: Record<string, unknown>;
          }) => Promise<Record<string, unknown> | null>;
        };
        const feedback = await feedbackDelegate.findUnique({
          where: {
            id: feedbackId,
          },
        });

        if (feedback) {
          const mappedFeedback = this.mapPrismaFeedback(feedback);
          this.cacheFeedback(mappedFeedback);
          return mappedFeedback;
        }
      } catch {
        // Fall through to the in-memory cache.
      }
    }

    const feedback = this.feedbackById.get(feedbackId);

    if (!feedback) {
      throw new NotFoundException(`Feedback "${feedbackId}" was not found.`);
    }

    return feedback;
  }

  async getOrGenerateFeedbackByAttemptId(attemptId: string) {
    const existing = this.feedbackByAttemptId.get(attemptId);

    if (existing) {
      return existing;
    }

    const prisma = await this.prismaService.getOptionalClient();

    if (prisma) {
      try {
        const feedbackDelegate = prisma.feedback as {
          findUnique: (args: {
            where: Record<string, unknown>;
          }) => Promise<Record<string, unknown> | null>;
        };
        const feedback = await feedbackDelegate.findUnique({
          where: {
            attemptId,
          },
        });

        if (feedback) {
          const mappedFeedback = this.mapPrismaFeedback(feedback);
          this.cacheFeedback(mappedFeedback);
          return mappedFeedback;
        }
      } catch {
        // Fall through to generation.
      }
    }

    return this.generateFeedback(attemptId);
  }

  async getRetryContext(sessionId: string) {
    const session = await this.sessionStore.getSessionById(sessionId);

    if (!session.latestAttemptId) {
      return {
        sessionId: session.id,
        previousAttemptId: '',
        previousTranscriptText: '',
        previousFeedbackId: '',
        previousScore: 0,
        focusPoints: [],
        conciseExamples: [],
        selectedModelId: session.selectedModelId,
      };
    }

    const attempt = await this.attemptStore.getAttemptById(session.latestAttemptId);
    const feedback =
      (await this.getOrGenerateFeedbackByAttemptId(attempt.id)) ?? (await this.generateFeedback(attempt.id));

    return {
      sessionId: session.id,
      previousAttemptId: attempt.id,
      previousTranscriptText: attempt.transcriptText,
      previousFeedbackId: feedback.id,
      previousScore: feedback.totalScore,
      focusPoints: feedback.retryFocusPoints,
      conciseExamples: [feedback.improvedAnswerExample],
      selectedModelId: session.selectedModelId,
    };
  }

  private buildStoredFeedback(
    attempt: Awaited<ReturnType<AttemptStoreService['getAttemptById']>>,
    session: Awaited<ReturnType<SessionStoreService['getSessionById']>>,
    generatedFeedback: FeedbackGenerationResult,
  ): StoredFeedback {
    return {
      id: randomUUID(),
      sessionId: session.id,
      attemptId: attempt.id,
      totalScore: generatedFeedback.totalScore,
      modelFitScore: generatedFeedback.modelFitScore,
      topicCoverageScore: generatedFeedback.topicCoverageScore,
      structureScore: generatedFeedback.structureScore,
      grammarScore: generatedFeedback.grammarScore,
      clarityScore: generatedFeedback.clarityScore,
      strengths: generatedFeedback.strengths,
      improvementPoints: generatedFeedback.improvementPoints,
      retryFocusPoints: generatedFeedback.retryFocusPoints,
      improvedAnswerExample: generatedFeedback.improvedAnswerExample,
      recommendReason: generatedFeedback.recommendReason,
      isPerfectScore: generatedFeedback.isPerfectScore,
      completionThresholdSnapshot: generatedFeedback.completionThresholdSnapshot,
      aiProvider: generatedFeedback.aiProvider,
      aiModel: generatedFeedback.aiModel,
      promptVersion: generatedFeedback.promptVersion,
      rubricVersion: generatedFeedback.rubricVersion,
      generationStatus: generatedFeedback.generationStatus,
      createdAt: new Date().toISOString(),
    };
  }

  private cacheFeedback(feedback: StoredFeedback) {
    this.feedbackByAttemptId.set(feedback.attemptId, feedback);
    this.feedbackById.set(feedback.id, feedback);
  }

  private mapPrismaFeedback(feedback: Record<string, unknown>): StoredFeedback {
    return {
      id: String(feedback.id),
      sessionId: String(feedback.sessionId),
      attemptId: String(feedback.attemptId),
      totalScore: Number(feedback.totalScore),
      modelFitScore: Number(feedback.modelFitScore),
      topicCoverageScore: Number(feedback.topicCoverageScore),
      structureScore: Number(feedback.structureScore),
      grammarScore: Number(feedback.grammarScore),
      clarityScore: Number(feedback.clarityScore),
      strengths: this.toStringArray(feedback.strengths),
      improvementPoints: this.toStringArray(feedback.improvementPoints),
      retryFocusPoints: this.toStringArray(feedback.retryFocusPoints),
      improvedAnswerExample: String(feedback.improvedAnswerExample),
      recommendReason: feedback.recommendReason ? String(feedback.recommendReason) : null,
      isPerfectScore: Boolean(feedback.isPerfectScore),
      completionThresholdSnapshot: Number(feedback.completionThresholdSnapshot),
      aiProvider: String(feedback.aiProvider),
      aiModel: String(feedback.aiModel),
      promptVersion: String(feedback.promptVersion),
      rubricVersion: String(feedback.rubricVersion),
      generationStatus: String(feedback.generationStatus) as StoredFeedback['generationStatus'],
      createdAt: this.toIsoString(feedback.createdAt),
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
