import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { FeedbackStoreService } from '../feedback/feedback-store.service';

@ApiTags('retry')
@Controller('sessions')
export class RetryController {
  constructor(private readonly feedbackStore: FeedbackStoreService) {}

  @Get(':sessionId/retry-context')
  @ApiOkResponse({
    schema: {
      example: {
        sessionId: 'session-example',
        previousAttemptId: 'attempt-example',
        previousTranscriptText: 'スマートフォンというのは...',
        previousFeedbackId: 'feedback-example',
        previousScore: 78,
        focusPoints: ['最後に一文でまとめを入れると、説明全体が締まって聞き手に残りやすくなります。'],
        conciseExamples: ['このように、いつでも使える便利な道具です。'],
        selectedModelId: 'stepbystep',
      },
    },
  })
  getRetryContext(@Param('sessionId') sessionId: string) {
    return this.feedbackStore.getRetryContext(sessionId);
  }
}
