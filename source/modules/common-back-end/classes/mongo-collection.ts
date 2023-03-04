import { Document } from 'mongodb';
import { MongoDatabase } from './mongo-database';

export class MongoCollection<T extends Document> {
  private mongoDatabase: MongoDatabase = new MongoDatabase();

  constructor(private name: 'formal-systems' | 'users') {
  }

  public async getCollection() {
    const db = await this.mongoDatabase.getDb();

    return db.collection<T>(this.name);
  }
};
