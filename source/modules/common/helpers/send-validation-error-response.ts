import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { NextApiResponse } from 'next';
import { sendErrorResponse } from './send-error-response';

export const sendValidationErrorResponse = (response: NextApiResponse<ErrorResponse>): void => {
  return sendErrorResponse(response, StatusCodes.ValidationFailed, 'Payload did not pass validation.');
};
