import { MongoDatabase } from '@/common-back-end/classes';
import { Get, HttpCode } from 'next-api-decorators';

export class AppHandler {
  private mongoDatabase: MongoDatabase = new MongoDatabase();

  @Get()
  @HttpCode(204)
  async healthCheck(): Promise<void> {
    const db = await this.mongoDatabase.getDb();

    const dbStats = await db.stats();

    console.log(dbStats);
  }
};
