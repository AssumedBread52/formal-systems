import { NextApiRequest, NextApiResponse } from 'next';

export const healthCheck = async (_: NextApiRequest, response: NextApiResponse<void>): Promise<void> => {
  response.status(200).end();
};
