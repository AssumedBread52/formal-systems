import { StatusCodes } from '@/app/constants';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export const healthCheck = async (_: NextApiRequest, response: NextApiResponse<void>): Promise<void> => {
  try {
    const client = await MongoClient.connect(`mongodb://${process.env.MONGO_USERNAME}:${encodeURIComponent(process.env.MONGO_PASSWORD ?? '')}@${process.env.MONGO_HOSTNAME}/formal-systems?authSource=admin`);

    await client.close();

    response.status(StatusCodes.EmptyResponseSuccess).end();
  } catch (error: any) {
    console.log(error);
    response.status(StatusCodes.DatabaseError).end();
  }
};
