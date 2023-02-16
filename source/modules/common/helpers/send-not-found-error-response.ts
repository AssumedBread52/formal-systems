import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { FormalSystemResourceTypes } from '@/formal-system/constants';
import { UserResourceTypes } from '@/user/constants';
import { NextApiResponse } from 'next';
import { sendErrorResponse } from './send-error-response';

export const sendNotFoundErrorResponse = (response: NextApiResponse<ErrorResponse>, dataType: FormalSystemResourceTypes | UserResourceTypes): void => {
  return sendErrorResponse(response, StatusCodes.NotFound, `${dataType} data not found.`);
};
