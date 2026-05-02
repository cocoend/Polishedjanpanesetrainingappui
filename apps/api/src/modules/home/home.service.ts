import { Injectable } from '@nestjs/common';

import { AttemptStoreService } from '../attempts/attempt-store.service';
import { FeedbackStoreService, type StoredFeedback } from '../feedback/feedback-store.service';
import {
  findThemeByIdOrSlug,
  getFirstActiveTheme,
  getThemeListItemByIdOrSlug,
} from '../master-data/master-data';
import { LearnedCardsService } from '../learned-cards/learned-cards.service';
import { SessionStoreService, type StoredSession } from '../sessions/session-store.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly sessionStore: SessionStoreService,
    private readonly attemptStore: AttemptStoreService,
    private readonly feedbackStore: FeedbackStoreService,
    private readonly learnedCardsService: LearnedCardsService,
  ) {}

  async getHome(anonymousUserId?: string) {
    const fallbackTheme = getFirstActiveTheme() ?? null;

    if (!anonymousUserId) {
      return {
        latestScore: null,
        shouldContinueCurrentTheme: false,
        recommendReason: '最初のテーマから説明練習を始めましょう。',
        completionThreshold: 100,
        recommendedTheme: fallbackTheme,
        continueSessionId: null,
        continueTheme: null,
        continueSelectedModelId: null,
        continueProgressPercent: 0,
        weakPoints: ['構成のまとめ', '自然な文法', 'キーワードの網羅'],
        streakDays: 0,
        unreadLearnedCardCount: 0,
      };
    }

    const sessions = await this.sessionStore.listSessionsByAnonymousUserId(anonymousUserId);
    const latestSession = sessions[0] ?? null;
    const latestUnfinishedSession = await this.sessionStore.getLatestUnfinishedSession(anonymousUserId);
    const latestFeedback = await this.findLatestFeedback(sessions);
    const latestFeedbackSession = latestFeedback
      ? sessions.find((session) => session.id === latestFeedback.sessionId) ?? null
      : null;
    const completionThreshold = latestFeedbackSession?.completionThreshold ?? 100;
    const recommendation = this.buildRecommendation(latestFeedbackSession, latestFeedback, fallbackTheme);

    return {
      latestScore: latestFeedback?.totalScore ?? null,
      shouldContinueCurrentTheme: recommendation.shouldContinueCurrentTheme,
      recommendReason: recommendation.recommendReason,
      completionThreshold,
      recommendedTheme: recommendation.recommendedTheme,
      continueSessionId: latestUnfinishedSession?.id ?? null,
      continueTheme: latestUnfinishedSession
        ? getThemeListItemByIdOrSlug(latestUnfinishedSession.themeId) ?? null
        : null,
      continueSelectedModelId: latestUnfinishedSession?.selectedModelId ?? null,
      continueProgressPercent: this.computeContinueProgressPercent(
        latestUnfinishedSession,
        latestUnfinishedSession ? await this.findSessionLatestFeedback(latestUnfinishedSession) : null,
      ),
      weakPoints: this.buildWeakPoints(latestFeedback),
      streakDays: await this.computeStreakDays(sessions),
      unreadLearnedCardCount: (await this.learnedCardsService
        .listCardsByAnonymousUserId(anonymousUserId))
        .filter((card) => !card.isRead).length,
    };
  }

  private async findLatestFeedback(sessions: StoredSession[]) {
    const feedbacks = await Promise.all(sessions.map((session) => this.findSessionLatestFeedback(session)));

    return feedbacks
      .filter((feedback): feedback is StoredFeedback => feedback !== null)
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0] ?? null;
  }

  private findSessionLatestFeedback(session: StoredSession) {
    if (!session.latestAttemptId) {
      return Promise.resolve(null);
    }

    return this.feedbackStore.getOrGenerateFeedbackByAttemptId(session.latestAttemptId);
  }

  private buildRecommendation(
    latestSession: StoredSession | null,
    latestFeedback: StoredFeedback | null,
    fallbackTheme: ReturnType<typeof getFirstActiveTheme> | null,
  ) {
    if (!latestSession || !latestFeedback) {
      return {
        shouldContinueCurrentTheme: false,
        recommendReason: '最初のテーマから説明練習を始めましょう。',
        recommendedTheme: fallbackTheme,
      };
    }

    const currentTheme = findThemeByIdOrSlug(latestSession.themeId);

    if (!currentTheme) {
      return {
        shouldContinueCurrentTheme: false,
        recommendReason: '次のテーマを選んで練習を始めましょう。',
        recommendedTheme: fallbackTheme,
      };
    }

    if (latestFeedback.totalScore < latestSession.completionThreshold) {
      return {
        shouldContinueCurrentTheme: true,
        recommendReason:
          latestFeedback.recommendReason ??
          '前回のスコアが100点未満のため、同じテーマでもう一度練習しましょう。',
        recommendedTheme: getThemeListItemByIdOrSlug(currentTheme.id) ?? fallbackTheme,
      };
    }

    const nextTheme = currentTheme.nextThemeId
      ? getThemeListItemByIdOrSlug(currentTheme.nextThemeId) ?? fallbackTheme
      : fallbackTheme;

    return {
      shouldContinueCurrentTheme: false,
      recommendReason: '今回のテーマは完成基準に達しました。次の関連テーマに進みましょう。',
      recommendedTheme: nextTheme,
    };
  }

  private buildWeakPoints(latestFeedback: StoredFeedback | null) {
    if (!latestFeedback) {
      return ['構成のまとめ', '自然な文法', 'キーワードの網羅'];
    }

    const weakPoints: string[] = [];

    if (latestFeedback.structureScore < 5) {
      weakPoints.push('構成のまとめ');
    }

    if (latestFeedback.grammarScore < 9) {
      weakPoints.push('自然な文法');
    }

    if (latestFeedback.topicCoverageScore < 10) {
      weakPoints.push('キーワードの網羅');
    }

    if (latestFeedback.modelFitScore < 50) {
      weakPoints.push('説明モデルの型');
    }

    if (latestFeedback.clarityScore < 20) {
      weakPoints.push('わかりやすさ');
    }

    return weakPoints.length > 0 ? weakPoints.slice(0, 3) : ['表現の自然さ', '説明の締め'];
  }

  private async computeStreakDays(sessions: StoredSession[]) {
    if (sessions.length === 0) {
      return 0;
    }

    const sessionActivity = await Promise.all(
      sessions.map(async (session) => ({
        session,
        attempts: await this.attemptStore.listAttemptsBySessionId(session.id),
      })),
    );
    const activityDaySet = new Set(
      sessionActivity.flatMap(({ attempts }) =>
        attempts.map((attempt) => this.toTokyoDateKey(attempt.submittedAt)),
      ),
    );
    const todayKey = this.toTokyoDateKey(new Date().toISOString());

    if (!activityDaySet.has(todayKey)) {
      return 0;
    }

    let streak = 0;
    let cursor = todayKey;

    while (activityDaySet.has(cursor)) {
      streak += 1;
      cursor = this.addDaysToDateKey(cursor, -1);
    }

    return streak;
  }

  private toTokyoDateKey(isoDate: string) {
    const tokyoOffsetMs = 9 * 60 * 60 * 1000;
    return new Date(new Date(isoDate).getTime() + tokyoOffsetMs).toISOString().slice(0, 10);
  }

  private addDaysToDateKey(dateKey: string, days: number) {
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private computeContinueProgressPercent(
    session: StoredSession | null,
    latestFeedback: StoredFeedback | null,
  ) {
    if (!session) {
      return 0;
    }

    if (latestFeedback) {
      return Math.max(20, Math.min(95, latestFeedback.totalScore));
    }

    if (session.status === 'feedback_ready') {
      return 85;
    }

    if (session.status === 'transcribed') {
      return 70;
    }

    if (session.status === 'recording') {
      return 40;
    }

    return 15;
  }
}
