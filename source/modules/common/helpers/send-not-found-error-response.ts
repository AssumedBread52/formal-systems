import { NextApiResponse } from 'next';
import { ErrorResponse } from '@/common/types';
import { UserResourceTypes } from '@/user/constants';
import { sendErrorResponse } from './send-error-response';
import { StatusCodes } from '@/common/constants';

export const sendNotFoundErrorResponse = (response: NextApiResponse<ErrorResponse>, dataType: UserResourceTypes): void => {
  return sendErrorResponse(response, StatusCodes.NotFound, `${dataType} data not found.`);
};
