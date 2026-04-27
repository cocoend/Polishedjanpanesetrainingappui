import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { LearnedCardsService } from './learned-cards.service';

const ANONYMOUS_USER_HEADER = 'x-anonymous-user-id';

@ApiTags('learned-cards')
@Controller()
export class LearnedCardsController {
  constructor(private readonly learnedCardsService: LearnedCardsService) {}

  @Post('sessions/:sessionId/learned-card')
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'learned-card-example',
        sessionId: 'session-example',
        feedbackId: 'feedback-example',
        themeId: 'theme-coffee',
        themeLevel: '初級',
        selectedModelId: 'stepbystep',
        title: 'コーヒーを説明する',
        summary: '前回のスコアが100点未満のため、同じテーマでもう一度練習しましょう。',
        keyTakeaways: ['最後に一文でまとめを入れると、説明全体が締まって聞き手に残りやすくなります。'],
        examplePhrases: ['...'],
        purposeTags: ['日常会話'],
        latestScore: 78,
        bestScore: 78,
        attemptCount: 1,
        improvementFromFirstScore: 0,
        isRead: false,
        savedAt: new Date().toISOString(),
        readAt: null,
      },
    },
  })
  async saveLatestSessionCard(
    @Headers(ANONYMOUS_USER_HEADER) anonymousUserId: string | undefined,
    @Param('sessionId') sessionId: string,
  ) {
    const normalizedAnonymousUserId = this.requireAnonymousUserId(anonymousUserId);
    const card = await this.learnedCardsService.saveLatestSessionCard(sessionId);
    this.assertOwnership(card.anonymousUserId, normalizedAnonymousUserId);
    return card;
  }

  @Get('learned-cards')
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  @ApiOkResponse({
    schema: {
      example: {
        cards: [],
      },
    },
  })
  async listCards(@Headers(ANONYMOUS_USER_HEADER) anonymousUserId: string | undefined) {
    const normalizedAnonymousUserId = this.requireAnonymousUserId(anonymousUserId);

    return {
      cards: await this.learnedCardsService.listCardsByAnonymousUserId(normalizedAnonymousUserId),
    };
  }

  @Get('learned-cards/:cardId')
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  async getCard(
    @Headers(ANONYMOUS_USER_HEADER) anonymousUserId: string | undefined,
    @Param('cardId') cardId: string,
  ) {
    const normalizedAnonymousUserId = this.requireAnonymousUserId(anonymousUserId);
    const card = await this.learnedCardsService.getCardById(cardId);
    this.assertOwnership(card.anonymousUserId, normalizedAnonymousUserId);
    return card;
  }

  @Patch('learned-cards/:cardId/read')
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  async markAsRead(
    @Headers(ANONYMOUS_USER_HEADER) anonymousUserId: string | undefined,
    @Param('cardId') cardId: string,
  ) {
    const normalizedAnonymousUserId = this.requireAnonymousUserId(anonymousUserId);
    const card = await this.learnedCardsService.getCardById(cardId);
    this.assertOwnership(card.anonymousUserId, normalizedAnonymousUserId);
    return this.learnedCardsService.markAsRead(cardId);
  }

  @Delete('learned-cards/:cardId')
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  async deleteCard(
    @Headers(ANONYMOUS_USER_HEADER) anonymousUserId: string | undefined,
    @Param('cardId') cardId: string,
  ) {
    const normalizedAnonymousUserId = this.requireAnonymousUserId(anonymousUserId);
    const card = await this.learnedCardsService.getCardById(cardId);
    this.assertOwnership(card.anonymousUserId, normalizedAnonymousUserId);
    return this.learnedCardsService.deleteCard(cardId);
  }

  private requireAnonymousUserId(anonymousUserId?: string) {
    if (!anonymousUserId) {
      throw new BadRequestException(
        `Missing anonymous user id. Provide it via "${ANONYMOUS_USER_HEADER}".`,
      );
    }

    return anonymousUserId;
  }

  private assertOwnership(ownerAnonymousUserId: string, requestAnonymousUserId: string) {
    if (ownerAnonymousUserId !== requestAnonymousUserId) {
      throw new BadRequestException('This learned card does not belong to the current anonymous user.');
    }
  }
}
