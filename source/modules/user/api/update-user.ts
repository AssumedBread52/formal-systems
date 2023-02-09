import { authConfiguration } from '@/auth/constants';
import { StatusCodes } from '@/common/constants';
import { buildMongoUrl, hasText, sendCollisionErrorResponse, sendDatabaseErrorResponse, sendMethodTypeErrorResponse, sendNotFoundErrorResponse, sendServerErrorResponse, sendUnauthorizedErrorResponse } from '@/common/helpers';
import { ErrorResponse, IdResponse } from '@/common/types';
import { UserResourceTypes, UserServerTasks } from '@/user/constants';
import { isEmail } from '@/user/helpers';
import { EditProfilePayload, ServerUser } from '@/user/types';
import { hash } from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export const updateUser = async (request: NextApiRequest, response: NextApiResponse<ErrorResponse | IdResponse>): Promise<void> => {
  try {
    const { method, body } = request;
    const { firstName, lastName, email, password } = body as EditProfilePayload;

    if ('PATCH' !== method) {
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

    if (!sessionUser) {
      return sendNotFoundErrorResponse(response, UserResourceTypes.SessionUser);
    }

    if (firstName && hasText(firstName)) {
      sessionUser.firstName = firstName.trim();
    }
    if (lastName && hasText(lastName)) {
      sessionUser.lastName = lastName.trim();
    }
    if (email && isEmail(email)) {
      sessionUser.email = email.trim();
    }
    if (password && hasText(password)) {
      sessionUser.hashedPassword = await hash(password.trim(), 12);
    }

    const collision = await userCollection.findOne({
      $and: [
        { _id: { $ne: sessionUser._id } },
        { email: sessionUser.email }
      ]
    });

    if (collision) {
      await client.close();

      return sendCollisionErrorResponse(response, ['email']);
    }

    const result = await userCollection.updateOne({
      _id: sessionUser._id
    }, {
      $set: {
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        email: sessionUser.email,
        hashedPassword: sessionUser.hashedPassword
      }
    });

    await client.close();

    if (!result.acknowledged || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0) {
      return sendDatabaseErrorResponse(response, UserServerTasks.Update);
    }

    return response.status(StatusCodes.Success).json({
      id: sessionUser._id.toString()
    });
  }
  catch {
    return sendServerErrorResponse(response, UserServerTasks.Update);
  }
};
