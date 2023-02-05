import { StatusCodes } from '@/app/constants';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export const healthCheck = async (_: NextApiRequest, response: NextApiResponse<void>): Promise<void> => {
  try {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const hostname = process.env.MONGO_HOSTNAME;
    const encodedPassword = encodeURIComponent(password ?? '');
    const credentials = `${username}:${encodedPassword}`;
    const connectionString = `mongodb://${credentials}@${hostname}/formal-systems?authSource=admin`;

    const client = await MongoClient.connect(connectionString);

    await client.close();

    response.status(StatusCodes.EmptyResponseSuccess).end();
  } catch (error: any) {
    console.log(error);
    response.status(StatusCodes.DatabaseError).end();
  }
};
