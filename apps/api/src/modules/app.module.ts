import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';

import { AttemptsController } from './attempts/attempts.controller';
import { AttemptStoreService } from './attempts/attempt-store.service';
import { ExplanationModelsController } from './explanation-models/explanation-models.controller';
import { FeedbackController } from './feedback/feedback.controller';
import { FeedbackGenerationService } from './feedback/feedback-generation.service';
import { FeedbackStoreService } from './feedback/feedback-store.service';
import { HealthController } from './health/health.controller';
import { HomeController } from './home/home.controller';
import { HomeService } from './home/home.service';
import { LearnedCardsController } from './learned-cards/learned-cards.controller';
import { LearnedCardsService } from './learned-cards/learned-cards.service';
import { MasterDataService } from './master-data/master-data.service';
import { PrismaService } from './prisma/prisma.service';
import { RetryController } from './retry/retry.controller';
import { SessionStoreService } from './sessions/session-store.service';
import { SessionsController } from './sessions/sessions.controller';
import { ThemesController } from './themes/themes.controller';
import { TranscriptionService } from './transcription/transcription.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../../.env'),
      ],
    }),
  ],
  controllers: [
    HealthController,
    HomeController,
    ThemesController,
    ExplanationModelsController,
    SessionsController,
    AttemptsController,
    FeedbackController,
    RetryController,
    LearnedCardsController,
  ],
  providers: [
    SessionStoreService,
    AttemptStoreService,
    FeedbackGenerationService,
    FeedbackStoreService,
    LearnedCardsService,
    HomeService,
    MasterDataService,
    PrismaService,
    TranscriptionService,
  ],
})
export class AppModule {}
