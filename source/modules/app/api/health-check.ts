import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from '@/app/constants';

export const healthCheck = async (_: NextApiRequest, response: NextApiResponse<void>): Promise<void> => {
  response.status(StatusCodes.EmptyResponseSuccess).end();
};
