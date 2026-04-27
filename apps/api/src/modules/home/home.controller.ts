import { Controller, Get, Headers } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { HomeService } from './home.service';

const ANONYMOUS_USER_HEADER = 'x-anonymous-user-id';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: false })
  @ApiOkResponse({
    schema: {
      example: {
        latestScore: 89,
        shouldContinueCurrentTheme: true,
        recommendReason: '前回のスコアが100点未満のため、同じテーマでもう一度練習しましょう。',
        completionThreshold: 100,
        recommendedTheme: null,
        continueSessionId: 'session-example',
        continueTheme: null,
        continueSelectedModelId: 'stepbystep',
        continueProgressPercent: 89,
        weakPoints: ['構成のまとめ', 'わかりやすさ'],
        streakDays: 1,
        unreadLearnedCardCount: 1,
      },
    },
  })
  getHome(@Headers(ANONYMOUS_USER_HEADER) anonymousUserId?: string) {
    return this.homeService.getHome(anonymousUserId);
  }
}
