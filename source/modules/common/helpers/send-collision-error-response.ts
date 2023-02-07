import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { NextApiResponse } from 'next';
import { sendErrorResponse } from './send-error-response';

export const sendCollisionErrorResponse = (response: NextApiResponse<ErrorResponse>, fields: string[]): void => {
  return sendErrorResponse(response, StatusCodes.CollisionError, `${fields.join(', ')} must be unique.`);
};
