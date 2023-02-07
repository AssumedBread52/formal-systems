import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, sendCollisionErrorResponse, sendDatabaseErrorResponse, sendMethodTypeErrorResponse, sendServerErrorResponse, sendValidationErrorResponse } from '@/common/helpers';
import { ErrorResponse } from '@/common/types';
import { UserServerTasks } from '@/user/constants';
import { validateSignUpPayload } from '@/user/helpers';
import { ServerUser, SignUpPayload } from '@/user/types';
import { hash } from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export const createUser = async (request: NextApiRequest, response: NextApiResponse<ErrorResponse>): Promise<void> => {
  try {
    const { method, body } = request;
    const { firstName, lastName, email, password } = body as SignUpPayload;

    if ('POST' !== method) {
      return sendMethodTypeErrorResponse(response);
    }

    if (!validateSignUpPayload(body)) {
      return sendValidationErrorResponse(response);
    }

    const client = await MongoClient.connect(buildMongoUrl());

    const userCollection = client.db().collection<ServerUser>('users');

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const collision = await userCollection.findOne({
      email: trimmedEmail
    });

    if (collision) {
      await client.close();

      return sendCollisionErrorResponse(response, ['Email']);
    }

    const hashedPassword = await hash(trimmedPassword, 12);

    const result = await userCollection.insertOne({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      hashedPassword
    });

    await client.close();

    if (!result.acknowledged || !result.insertedId) {
      return sendDatabaseErrorResponse(response, UserServerTasks.Create);
    }

    response.status(StatusCodes.EmptyResponseSuccess).end();
  }
  catch {
    return sendServerErrorResponse(response, UserServerTasks.Create);
  }
};
