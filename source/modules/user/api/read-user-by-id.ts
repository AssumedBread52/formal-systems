import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, sendMethodTypeErrorResponse, sendNotFoundErrorResponse, sendServerErrorResponse } from '@/common/helpers';
import { ErrorResponse, SearchByIdQueryParameters } from '@/common/types';
import { UserResourceTypes, UserServerTasks } from '@/user/constants';
import { ClientUser, ServerUser } from '@/user/types';
import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export const readUserById = async (request: NextApiRequest, response: NextApiResponse<ClientUser | ErrorResponse>): Promise<void> => {
  try {
    const { method, query } = request;
    const { id } = query as SearchByIdQueryParameters;

    if ('GET' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    const client = await MongoClient.connect(buildMongoUrl());

    const user = await client.db().collection<ServerUser>('users').findOne({
      _id: new ObjectId(id)
    });

    await client.close();

    if (!user) {
      return sendNotFoundErrorResponse(response, UserResourceTypes.User);
    }

    const { _id, firstName, lastName } = user;

    return response.status(StatusCodes.Success).json({
      id: _id.toString(),
      firstName,
      lastName
    });
  } catch {
    return sendServerErrorResponse(response, UserServerTasks.ReadById);
  }
};
