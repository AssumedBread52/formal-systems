import { authConfiguration } from '@/auth/constants';
import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, sendDatabaseErrorResponse, sendMethodTypeErrorResponse, sendServerErrorResponse, sendUnauthorizedErrorResponse } from '@/common/helpers';
import { DeleteByIdPayload, ErrorResponse, IdResponse } from '@/common/types';
import { FormalSystemServerTasks } from '@/formal-system/constants';
import { ServerFormalSystem } from '@/formal-system/types';
import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export const deleteFormalSystem = async (request: NextApiRequest, response: NextApiResponse<IdResponse | ErrorResponse>): Promise<void> => {
  try {
    const { method, body } = request;
    const { id } = body as DeleteByIdPayload;

    if ('DELETE' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    const session = await getServerSession(request, response, authConfiguration);

    if (!session) {
      return sendUnauthorizedErrorResponse(response);
    }

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');
    
    const target = await formalSystemCollection.findOne({
      _id: new ObjectId(id)
    });

    if (target) {
      if (target.createdByUserId !== session.id) {
        await client.close();

        return sendUnauthorizedErrorResponse(response);
      }

      const result = await formalSystemCollection.deleteOne({
        _id: target._id
      });

      await client.close();

      if (!result.acknowledged || result.deletedCount !== 1) {
        return sendDatabaseErrorResponse(response, FormalSystemServerTasks.Delete);
      }
    } else {
      await client.close();
    }

    return response.status(StatusCodes.Success).json({
      id
    });
  } catch {
    return sendServerErrorResponse(response, FormalSystemServerTasks.Delete);
  }
};
