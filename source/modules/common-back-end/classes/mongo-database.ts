import { Singleton } from '@/common-back-end/decorators';
import { Db, MongoClient } from 'mongodb';

@Singleton<new () => MongoDatabase>
export class MongoDatabase {
  private client: MongoClient = new MongoClient(this.buildMongoUrl());
  private exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  constructor() {
    this.exitSignals.forEach((exitSignal: NodeJS.Signals): void => {
      process.removeAllListeners(exitSignal);

      process.on(exitSignal, this.Cleanup);
    });
  }

  public async getDb(): Promise<Db> {
    await this.client.connect();

    return this.client.db();
  }

  private buildMongoUrl(): string {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const hostname = process.env.MONGO_HOSTNAME;
  
    const encodedPassword = encodeURIComponent(password ?? '');
  
    const credentials = `${username}:${encodedPassword}`;
  
    return `mongodb://${credentials}@${hostname}/formal-systems?authSource=admin`;
  };

  private async Cleanup(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }

    process.exit(0);
  }
};
