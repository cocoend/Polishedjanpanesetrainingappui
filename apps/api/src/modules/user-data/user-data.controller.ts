import { BadRequestException, Controller, Delete, Headers } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UserDataService } from './user-data.service';

const ANONYMOUS_USER_HEADER = 'x-anonymous-user-id';

@ApiTags('user-data')
@Controller('me/data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Delete()
  @ApiHeader({ name: ANONYMOUS_USER_HEADER, required: true })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        anonymousUserId: 'ios_anon_example',
        deletedSessions: 2,
        deletedAttempts: 2,
        deletedFeedback: 2,
        deletedLearnedCards: 1,
        deletedUsers: 1,
      },
    },
  })
  deleteMyData(@Headers(ANONYMOUS_USER_HEADER) anonymousUserId?: string) {
    if (!anonymousUserId) {
      throw new BadRequestException(
        `Missing anonymous user id. Provide it via "${ANONYMOUS_USER_HEADER}".`,
      );
    }

    return this.userDataService.deleteAnonymousUserData(anonymousUserId);
  }
}
