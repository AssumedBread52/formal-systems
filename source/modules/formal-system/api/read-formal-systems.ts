import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, sendMethodTypeErrorResponse, sendServerErrorResponse } from '@/common/helpers';
import { ErrorResponse, PaginatedQueryParameters, PaginatedResults } from '@/common/types';
import { FormalSystemServerTasks } from '@/formal-system/constants';
import { ClientFormalSystem, ServerFormalSystem } from '@/formal-system/types';
import { MongoClient, WithId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export const readFormalSystems = async (request: NextApiRequest, response: NextApiResponse<PaginatedResults<ClientFormalSystem> | ErrorResponse>): Promise<void> => {
  try {
    const { method, query } = request;
    const { page, count, keywords } = query as PaginatedQueryParameters;

    if ('GET' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    let formalSystemsCursor;
    let total;
    if (!keywords || 0 === keywords.length) {
      formalSystemsCursor = formalSystemCollection.find();
      total = await formalSystemCollection.countDocuments();
    } else {
      const filter = {
        $text: {
          $caseSensitive: false,
          $search: Array.isArray(keywords) ? keywords.join(',') : keywords
        }
      };

      formalSystemsCursor = formalSystemCollection.find(filter);
      total = await formalSystemCollection.countDocuments(filter);
    }

    const pageIndex = parseInt(page);
    const itemsPerPage = parseInt(count);

    formalSystemsCursor.skip((pageIndex - 1) * itemsPerPage).limit(itemsPerPage);

    const formalSystems = await formalSystemsCursor.toArray();

    await client.close();

    return response.status(StatusCodes.Success).json({
      total,
      results: formalSystems.map((formalSystem: WithId<ServerFormalSystem>): ClientFormalSystem => {
        const { _id, title, urlPath, description, createdByUserId } = formalSystem;

        return {
          id: _id.toString(),
          title,
          urlPath,
          description,
          createdByUserId
        };
      })
    });
  } catch {
    return sendServerErrorResponse(response, FormalSystemServerTasks.ReadPaginated);
  }
};
