import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { FeedbackStoreService } from './feedback-store.service';

@ApiTags('feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackStore: FeedbackStoreService) {}

  @Post('attempts/:attemptId/feedback')
  @ApiOkResponse({
    schema: {
      example: {
        id: 'feedback-example',
        sessionId: 'session-example',
        attemptId: 'attempt-example',
        totalScore: 78,
        modelFitScore: 40,
        topicCoverageScore: 8,
        structureScore: 4,
        grammarScore: 8,
        clarityScore: 18,
        strengths: ['構造を意識して説明モデルに沿って話せています。'],
        improvementPoints: ['最後に一文でまとめを入れると、説明全体が締まって聞き手に残りやすくなります。'],
        retryFocusPoints: ['最後に一文でまとめを入れると、説明全体が締まって聞き手に残りやすくなります。'],
        improvedAnswerExample: '...',
        recommendReason: '前回のスコアが100点未満のため、同じテーマでもう一度練習しましょう。',
        isPerfectScore: false,
        completionThresholdSnapshot: 100,
        aiProvider: 'mvp-rule-engine',
        aiModel: 'prototype-v1',
        promptVersion: 'feedback-prompt-v1',
        rubricVersion: 'rubric-v1',
        generationStatus: 'completed',
        createdAt: new Date().toISOString(),
      },
    },
  })
  createFeedback(@Param('attemptId') attemptId: string) {
    return this.feedbackStore.generateFeedback(attemptId);
  }

  @Get('feedback/:feedbackId')
  @ApiOkResponse({
    schema: {
      example: {
        id: 'feedback-example',
      },
    },
  })
  getFeedback(@Param('feedbackId') feedbackId: string) {
    return this.feedbackStore.getFeedbackById(feedbackId);
  }
}
