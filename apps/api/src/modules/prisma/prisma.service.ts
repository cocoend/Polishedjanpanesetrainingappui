import { Injectable, OnModuleDestroy } from '@nestjs/common';

type DatabaseHealthStatus = 'not_configured' | 'connected' | 'unreachable';
type PrismaClientLike = {
  $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
  $disconnect: () => Promise<void>;
  [key: string]: unknown;
};

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private lastKnownStatus: DatabaseHealthStatus = process.env.DATABASE_URL
    ? 'unreachable'
    : 'not_configured';
  private prismaClient: PrismaClientLike | null = null;

  isConfigured() {
    return Boolean(process.env.DATABASE_URL);
  }

  async getHealthStatus(): Promise<DatabaseHealthStatus> {
    if (!this.isConfigured()) {
      this.lastKnownStatus = 'not_configured';
      return this.lastKnownStatus;
    }

    try {
      const client = await this.getClient();
      await client.$queryRaw`SELECT 1`;
      this.lastKnownStatus = 'connected';
    } catch {
      this.lastKnownStatus = 'unreachable';
    }

    return this.lastKnownStatus;
  }

  async onModuleDestroy() {
    if (!this.prismaClient) {
      return;
    }

    await this.prismaClient.$disconnect();
  }

  async getOptionalClient() {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      return await this.getClient();
    } catch {
      return null;
    }
  }

  private async getClient(): Promise<PrismaClientLike> {
    if (this.prismaClient) {
      return this.prismaClient;
    }

    const prismaModule = (await import('../../generated/prisma/client')) as Record<string, unknown>;
    const PrismaClientCtor = prismaModule.PrismaClient as
      | (new () => PrismaClientLike)
      | undefined;

    if (!PrismaClientCtor) {
      throw new Error(
        'PrismaClient is not available yet. Run `npm run db:generate` first.',
      );
    }

    this.prismaClient = new PrismaClientCtor();
    return this.prismaClient;
  }
}
