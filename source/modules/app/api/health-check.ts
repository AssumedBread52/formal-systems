import { StatusCodes } from '@/app/constants';
import { getMongoClient } from '@/common/helpers';
import { NextApiRequest, NextApiResponse } from 'next';

export const healthCheck = async (_: NextApiRequest, response: NextApiResponse<void>): Promise<void> => {
  try {
    const client = await getMongoClient();

    await client.close();

    response.status(StatusCodes.EmptyResponseSuccess).end();
  } catch {
    response.status(StatusCodes.DatabaseError).end();
  }
};
