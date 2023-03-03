import { buildMongoUrl } from '@/common-back-end/helpers';
import { MongoClient } from 'mongodb';
import { Get, HttpCode } from 'next-api-decorators';

export class AppHandler {
  @Get()
  @HttpCode(204)
  async healthCheck(): Promise<void> {
    const client = await MongoClient.connect(buildMongoUrl());

    await client.close();
  }
};
