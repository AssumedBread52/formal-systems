import { Collection, Document, Filter, FindCursor, OptionalUnlessRequiredId, UpdateFilter, WithId } from 'mongodb';
import { InternalServerErrorException } from 'next-api-decorators';
import { MongoDatabase } from './mongo-database';

export class MongoCollection<T extends Document> {
  private mongoDatabase: MongoDatabase = new MongoDatabase();

  constructor(private name: 'formal-systems' | 'users') {
  }

  public async countDocuments(filter?: Filter<T>): Promise<number> {
    const collection = await this.getCollection();

    return await collection.countDocuments(filter);
  }

  public async deleteOne(filter: Filter<T>): Promise<void> {
    const collection = await this.getCollection();

    const result = await collection.deleteOne(filter);

    const { acknowledged, deletedCount } = result;

    if (!acknowledged || deletedCount !== 1) {
      throw new InternalServerErrorException(`Deleting document from ${this.name} collection failed.`);
    }
  }

  public async find(filter?: Filter<T>): Promise<FindCursor<WithId<T>>> {
    const collection = await this.getCollection();

    if (filter) {
      return collection.find(filter);
    } else {
      return collection.find();
    }
  }

  public async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    const collection = await this.getCollection();

    return collection.findOne(filter);
  }

  public async insertOne(doc: OptionalUnlessRequiredId<T>): Promise<void> {
    const collection = await this.getCollection();

    const result = await collection.insertOne(doc);

    const { acknowledged, insertedId } = result;

    if (!acknowledged || !insertedId) {
      throw new InternalServerErrorException(`Inserting document into ${this.name} collection failed.`);
    }
  }

  public async updateOne(filter: Filter<T>, update: UpdateFilter<T> | Partial<T>): Promise<void> {
    const collection = await this.getCollection();

    const updateResult = await collection.updateOne(filter, update);

    const { acknowledged, matchedCount, modifiedCount, upsertedCount, upsertedId } = updateResult;

    if (!acknowledged || matchedCount !== 1 || modifiedCount !== 1 || upsertedCount !== 0 || upsertedId !== null) {
      throw new InternalServerErrorException(`Updating document in ${this.name} collection failed.`);
    }
  }

  private async getCollection(): Promise<Collection<T>> {
    const db = await this.mongoDatabase.getDb();

    return db.collection<T>(this.name);
  }
};
