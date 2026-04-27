import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { findThemeByIdOrSlug } from '../master-data/master-data';
import { SessionStoreService } from '../sessions/session-store.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { AttemptStoreService } from './attempt-store.service';

@ApiTags('attempts')
@Controller()
export class AttemptsController {
  constructor(
    private readonly attemptStore: AttemptStoreService,
    private readonly sessionStore: SessionStoreService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  @Post('sessions/:sessionId/attempts')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transcriptText: {
          type: 'string',
          description: 'Legacy JSON path or optional client-side transcript.',
        },
        audioMimeType: {
          type: 'string',
          example: 'audio/webm',
        },
        audioDurationSec: {
          type: 'number',
          example: 125,
        },
        audioFileSizeBytes: {
          type: 'number',
          example: 2048,
        },
        audio: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'attempt-example',
        sessionId: 'session-example',
        attemptIndex: 1,
        audioMimeType: 'audio/webm',
        audioDurationSec: 125,
        audioFileSizeBytes: 2048,
        transcriptText: 'スマートフォンというのは...',
        transcriptionStatus: 'completed',
        submittedAt: new Date().toISOString(),
      },
    },
  })
  async createAttempt(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      transcriptText?: string;
      audioMimeType?: string;
      audioDurationSec?: number | string;
      audioFileSizeBytes?: number | string;
    },
    @UploadedFile()
    audioFile?: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname?: string;
    },
  ) {
    const audioDurationSec = this.parseOptionalNumber(body.audioDurationSec);
    const audioFileSizeBytes = this.parseOptionalNumber(body.audioFileSizeBytes);

    if (audioFile) {
      return this.attemptStore.createUploadedAttempt({
        sessionId,
        transcriptText: body.transcriptText,
        audioDurationSec,
        file: audioFile,
      });
    }

    if (!body.transcriptText?.trim()) {
      throw new BadRequestException('transcriptText is required.');
    }

    return this.attemptStore.createAttempt({
      sessionId,
      transcriptText: body.transcriptText,
      audioMimeType: body.audioMimeType ?? 'audio/webm',
      audioDurationSec,
      audioFileSizeBytes,
    });
  }

  @Get('sessions/:sessionId/attempts')
  @ApiOkResponse({
    schema: {
      example: {
        attempts: [],
      },
    },
  })
  async listAttempts(@Param('sessionId') sessionId: string) {
    return {
      attempts: await this.attemptStore.listAttemptsBySessionId(sessionId),
    };
  }

  @Get('attempts/:attemptId')
  @ApiOkResponse({
    schema: {
      example: {
        id: 'attempt-example',
        sessionId: 'session-example',
        attemptIndex: 1,
        audioMimeType: 'audio/webm',
        audioDurationSec: 125,
        audioFileSizeBytes: 2048,
        transcriptText: 'スマートフォンというのは...',
        transcriptionStatus: 'completed',
        submittedAt: new Date().toISOString(),
      },
    },
  })
  async getAttempt(@Param('attemptId') attemptId: string) {
    return this.attemptStore.getAttemptById(attemptId);
  }

  @Post('attempts/:attemptId/transcribe')
  @ApiOkResponse({
    schema: {
      example: {
        id: 'attempt-example',
        sessionId: 'session-example',
        attemptIndex: 1,
        audioMimeType: 'audio/webm',
        audioDurationSec: 125,
        audioFileSizeBytes: 2048,
        transcriptText: 'まず、テーマの概要を説明します。',
        transcriptionStatus: 'completed',
        submittedAt: new Date().toISOString(),
      },
    },
  })
  async transcribeAttempt(@Param('attemptId') attemptId: string) {
    const attempt = await this.attemptStore.getAttemptById(attemptId);

    if (attempt.transcriptionStatus === 'completed') {
      return attempt;
    }

    const session = await this.sessionStore.getSessionById(attempt.sessionId);
    const theme = findThemeByIdOrSlug(session.themeId);
    const transcription = await this.transcriptionService.transcribeUploadedAttempt({
      themeTitle: theme?.title ?? session.themeId,
      selectedModelId: session.selectedModelId,
      audioStorageKey: attempt.audioStorageKey ?? null,
      audioMimeType: attempt.audioMimeType,
      audioDurationSec: attempt.audioDurationSec,
      audioFileSizeBytes: attempt.audioFileSizeBytes,
    });

    return this.attemptStore.completeAttemptTranscription({
      attemptId: attempt.id,
      transcriptText: transcription.transcriptText,
      transcriptionProvider: transcription.transcriptionProvider,
      transcriptionModel: transcription.transcriptionModel,
    });
  }

  private parseOptionalNumber(value: number | string | undefined) {
    if (value === undefined || value === null || value === '') {
      return 0;
    }

    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsed)) {
      throw new BadRequestException('audioDurationSec and audioFileSizeBytes must be numbers.');
    }

    return parsed;
  }
}
