import { MongoClient } from 'mongodb';

export const getMongoClient = async (): Promise<MongoClient> => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const hostname = process.env.MONGO_HOSTNAME;

  const encodedPassword = encodeURIComponent(password ?? '');

  const credentials = `${username}:${encodedPassword}`;

  const connectionString = `mongodb://${credentials}@${hostname}/formal-systems?authSource=admin`;

  return await MongoClient.connect(connectionString);
};
