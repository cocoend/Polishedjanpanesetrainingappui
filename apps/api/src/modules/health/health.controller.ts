import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'api',
        version: '0.1.0',
        database: {
          configured: true,
          status: 'connected',
        },
      },
    },
  })
  async getHealth() {
    const databaseStatus = await this.prismaService.getHealthStatus();

    return {
      status: 'ok',
      service: 'api',
      version: '0.1.0',
      database: {
        configured: this.prismaService.isConfigured(),
        status: databaseStatus,
      },
    };
  }
}
