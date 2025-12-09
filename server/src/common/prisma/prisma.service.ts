import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'info' | 'warn'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    // Log all queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (event: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Params: ${event.params}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      });
    }

    this.$on('error', (event: Prisma.LogEvent) => {
      this.logger.error(`Prisma Error: ${event.message}`);
    });

    this.$on('warn', (event: Prisma.LogEvent) => {
      this.logger.warn(`Prisma Warning: ${event.message}`);
    });

    this.$on('info', (event: Prisma.LogEvent) => {
      this.logger.log(`Prisma Info: ${event.message}`);
    });

    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Database disconnected');
  }

  /**
   * Clean database (for testing purposes)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Add tables to clean in correct order (respecting foreign keys)
    const tablenames = Prisma.dmmf.datamodel.models.map((model) => model.name);
    
    for (const tablename of tablenames) {
      try {
        await this.$executeRawUnsafe(`DELETE FROM \`${tablename}\``);
      } catch (error) {
        // Table might not exist or have dependencies, skip
      }
    }
  }
}
