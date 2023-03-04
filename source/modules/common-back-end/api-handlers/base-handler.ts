import { MongoDatabase } from '@/common-back-end/classes';

export class BaseHandler {
  protected mongoDatabase: MongoDatabase = new MongoDatabase();
};
