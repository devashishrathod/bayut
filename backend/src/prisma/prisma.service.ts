import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const rawUrl = process.env.DATABASE_URL;
    const url = rawUrl?.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

    if (!url) {
      throw new Error('DATABASE_URL is not set. Please configure backend/.env');
    }

    const pool = new Pool({
      connectionString: url,
      ssl: url.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks() {
    process.on('beforeExit', async () => {
      await this.$disconnect();
    });
  }
}
