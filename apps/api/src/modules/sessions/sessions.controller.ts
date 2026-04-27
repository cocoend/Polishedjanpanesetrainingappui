import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { findExplanationModelByIdOrSlug, findThemeByIdOrSlug } from '../master-data/master-data';
import { SessionStoreService } from './session-store.service';

const ANONYMOUS_USER_HEADER = 'x-anonymous-user-id';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionStore: SessionStoreService) {}

  @Get('latest-unfinished')
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: false })
  @ApiOkResponse({
    schema: {
      example: {
        session: null,
      },
    },
  })
  async getLatestUnfinished(
    @Headers(ANONYMOUS_USER_HEADER) anonymousUserIdHeader?: string,
    @Query('anonymousUserId') anonymousUserIdQuery?: string,
  ) {
    const anonymousUserId = anonymousUserIdHeader ?? anonymousUserIdQuery;

    if (!anonymousUserId) {
      return {
        session: null,
      };
    }

    return {
      session: await this.sessionStore.getLatestUnfinishedSession(anonymousUserId),
    };
  }

  @Post()
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'session-example',
        anonymousUserId: 'anon-example',
        themeId: 'theme-coffee',
        selectedModelId: 'model-stepbystep',
        status: 'draft',
        latestAttemptId: null,
        completionThreshold: 100,
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  })
  async createSession(
    @Headers(ANONYMOUS_USER_HEADER) anonymousUserId: string | undefined,
    @Body() body: { themeId: string; selectedModelId: string },
  ) {
    const normalizedAnonymousUserId = this.requireAnonymousUserId(anonymousUserId);

    if (!findThemeByIdOrSlug(body.themeId)) {
      throw new BadRequestException(`Theme "${body.themeId}" is invalid.`);
    }

    if (!findExplanationModelByIdOrSlug(body.selectedModelId)) {
      throw new BadRequestException(`Explanation model "${body.selectedModelId}" is invalid.`);
    }

    return this.sessionStore.createSession({
      anonymousUserId: normalizedAnonymousUserId,
      themeId: body.themeId,
      selectedModelId: body.selectedModelId,
    });
  }

  @Get(':sessionId')
  @ApiOkResponse({
    schema: {
      example: {
        id: 'session-example',
        anonymousUserId: 'anon-example',
        themeId: 'theme-coffee',
        selectedModelId: 'model-stepbystep',
        status: 'draft',
        latestAttemptId: null,
        completionThreshold: 100,
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  })
  getSession(@Param('sessionId') sessionId: string) {
    return this.sessionStore.getSessionById(sessionId);
  }

  @Patch(':sessionId/status')
  @ApiOkResponse({
    schema: {
      example: {
        id: 'session-example',
        anonymousUserId: 'anon-example',
        themeId: 'theme-coffee',
        selectedModelId: 'model-stepbystep',
        status: 'recording',
        latestAttemptId: null,
        completionThreshold: 100,
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  })
  updateSessionStatus(
    @Param('sessionId') sessionId: string,
    @Body() body: { status: StoredSessionStatus; completedAt?: string | null },
  ) {
    return this.sessionStore.updateSessionStatus(sessionId, body);
  }

  private requireAnonymousUserId(anonymousUserId?: string) {
    if (!anonymousUserId) {
      throw new BadRequestException(
        `Missing anonymous user id. Provide it via "${ANONYMOUS_USER_HEADER}".`,
      );
    }

    return anonymousUserId;
  }
}

type StoredSessionStatus =
  | 'draft'
  | 'recording'
  | 'uploaded'
  | 'transcribed'
  | 'feedback_ready'
  | 'completed'
  | 'abandoned';
