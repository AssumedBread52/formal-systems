import { authConfiguration } from '@/auth/constants';
import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, buildUrlPath, sendCollisionErrorResponse, sendDatabaseErrorResponse, sendMethodTypeErrorResponse, sendServerErrorResponse, sendUnauthorizedErrorResponse, sendValidationErrorResponse } from '@/common/helpers';
import { ErrorResponse } from '@/common/types';
import { FormalSystemServerTasks } from '@/formal-system/constants';
import { validateNewFormalSystemPayload } from '@/formal-system/helpers';
import { NewFormalSystemPayload, ServerFormalSystem } from '@/formal-system/types';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export const createFormalSystem = async (request: NextApiRequest, response: NextApiResponse<ErrorResponse>): Promise<void> => {
  try {
    const { method, body } = request;
    const { title, description } = body as NewFormalSystemPayload;

    if ('POST' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    if (!validateNewFormalSystemPayload(body)) {
      return sendValidationErrorResponse(response);
    }

    const session = await getServerSession(request, response, authConfiguration);

    if (!session) {
      return sendUnauthorizedErrorResponse(response);
    }

    const urlPath = buildUrlPath(title);

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    const collision = await formalSystemCollection.findOne({
      urlPath
    });

    if (collision) {
      await client.close();

      return sendCollisionErrorResponse(response, ['URL path']);
    }

    const { id } = session;
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    const result = await formalSystemCollection.insertOne({
      title: trimmedTitle,
      urlPath,
      description: trimmedDescription,
      createdByUserId: id
    });

    await client.close();

    if (!result.acknowledged || !result.insertedId) {
      return sendDatabaseErrorResponse(response, FormalSystemServerTasks.Create);
    }

    response.status(StatusCodes.EmptyResponseSuccess).end();
  } catch {
    return sendServerErrorResponse(response, FormalSystemServerTasks.Create);
  }
};
