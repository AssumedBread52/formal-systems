import { StatusCodes } from '@/common/constants';
import { ErrorResponse } from '@/common/types';
import { FormalSystemServerTasks } from '@/formal-system/constants';
import { UserServerTasks } from '@/user/constants';
import { NextApiResponse } from 'next';
import { sendErrorResponse } from './send-error-response';

export const sendDatabaseErrorResponse = (response: NextApiResponse<ErrorResponse>, task: FormalSystemServerTasks | UserServerTasks): void => {
  return sendErrorResponse(response, StatusCodes.DatabaseError, `Database failed to ${task}.`);
};
