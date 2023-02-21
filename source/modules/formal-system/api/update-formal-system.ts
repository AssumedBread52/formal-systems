import { authConfiguration } from '@/auth/constants';
import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, buildUrlPath, hasText, sendCollisionErrorResponse, sendDatabaseErrorResponse, sendMethodTypeErrorResponse, sendNotFoundErrorResponse, sendServerErrorResponse, sendUnauthorizedErrorResponse } from '@/common/helpers';
import { ErrorResponse, IdResponse } from '@/common/types';
import { FormalSystemResourceTypes, FormalSystemServerTasks } from '@/formal-system/constants';
import { ServerFormalSystem, UpdateFormalSystemPayload } from '@/formal-system/types';
import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export const updateFormalSystem = async (request: NextApiRequest, response: NextApiResponse<IdResponse | ErrorResponse>): Promise<void> => {
  try {
    const { method, body } = request;
    const { id, title, description } = body as UpdateFormalSystemPayload;

    if ('PATCH' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    const session = await getServerSession(request, response, authConfiguration);

    if (!session) {
      return sendUnauthorizedErrorResponse(response);
    }

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    const formalSystem = await formalSystemCollection.findOne({
      _id: new ObjectId(id),
      createdByUserId: session.id
    });

    if (!formalSystem) {
      return sendNotFoundErrorResponse(response, FormalSystemResourceTypes.FormalSystem);
    }

    if (title && hasText(title)) {
      formalSystem.title = title.trim();
      formalSystem.urlPath = buildUrlPath(title);
    }
    if (description && hasText(description)) {
      formalSystem.description = description.trim();
    }

    const collision = await formalSystemCollection.findOne({
      $and: [
        { _id: { $ne: new ObjectId(id) } },
        { urlPath: formalSystem.urlPath }
      ]
    });

    if (collision) {
      await client.close();

      return sendCollisionErrorResponse(response, ['URL path']);
    }

    const result = await formalSystemCollection.updateOne({
      _id: new ObjectId(id)
    }, {
      $set: {
        title: formalSystem.title,
        urlPath: formalSystem.urlPath,
        description: formalSystem.description
      }
    });

    await client.close();

    if (!result.acknowledged || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0) {
      return sendDatabaseErrorResponse(response, FormalSystemServerTasks.Update);
    }

    return response.status(StatusCodes.Success).json({
      id
    });
  } catch {
    return sendServerErrorResponse(response, FormalSystemServerTasks.Update);
  }
};
