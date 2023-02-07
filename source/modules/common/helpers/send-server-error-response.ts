import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { UserServerTasks } from '@/user/constants';
import { NextApiResponse } from 'next';
import { sendErrorResponse } from './send-error-response';

export const sendServerErrorResponse = (response: NextApiResponse<ErrorResponse>, task: UserServerTasks): void => {
  return sendErrorResponse(response, StatusCodes.ServerError, `Server failed to ${task}.`);
};
