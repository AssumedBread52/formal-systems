import { authConfiguration } from '@/auth/constants';
import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, sendMethodTypeErrorResponse, sendNotFoundErrorResponse, sendServerErrorResponse, sendUnauthorizedErrorResponse } from '@/common/helpers';
import { ErrorResponse } from '@/common/types';
import { UserResourceTypes, UserServerTasks } from '@/user/constants';
import { ServerUser, SessionUser } from '@/user/types';
import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export const readSessionUser = async (request: NextApiRequest, response: NextApiResponse<ErrorResponse | SessionUser>): Promise<void> => {
  try {
    const { method } = request;

    if ('GET' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    const session = await getServerSession(request, response, authConfiguration);

    if (!session) {
      return sendUnauthorizedErrorResponse(response);
    }

    const { id } = session;

    const client = await MongoClient.connect(buildMongoUrl());

    const userCollection = client.db().collection<ServerUser>('users');

    const sessionUser = await userCollection.findOne({
      _id: new ObjectId(id)
    });

    await client.close();
    
    if (!sessionUser) {
      return sendNotFoundErrorResponse(response, UserResourceTypes.SessionUser);
    }

    const { firstName, lastName, email } = sessionUser;

    return response.status(StatusCodes.Success).json({
      firstName,
      lastName,
      email
    });
  } catch {
    return sendServerErrorResponse(response, UserServerTasks.ReadSessionUser);
  }
};
