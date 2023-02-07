import { StatusCodes } from '@/common/constants';
import { buildMongoUrl } from '@/common/helpers';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export const healthCheck = async (_: NextApiRequest, response: NextApiResponse<void>): Promise<void> => {
  try {
    const client = await MongoClient.connect(buildMongoUrl());

    await client.close();

    response.status(StatusCodes.EmptyResponseSuccess).end();
  } catch {
    response.status(StatusCodes.DatabaseError).end();
  }
};
