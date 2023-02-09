import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { NextApiResponse } from 'next';
import { sendErrorResponse } from './send-error-response';

export const sendUnauthorizedErrorResponse = (response: NextApiResponse<ErrorResponse>): void => {
  return sendErrorResponse(response, StatusCodes.Unauthorized, 'Unauthorized access restricted.');
};
