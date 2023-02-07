import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { NextApiResponse } from 'next';

export const sendErrorResponse = (response: NextApiResponse<ErrorResponse>, statusCode: StatusCodes, message: string): void => {
  return response.status(statusCode).json({
    message
  });
};
