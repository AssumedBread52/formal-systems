import { buildMongoUrl } from '@/common/helpers';
import { IdResponse } from '@/common/types';
import { hash } from 'bcryptjs';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MongoClient, ObjectId } from 'mongodb';
import type { NextApiRequest } from 'next';
import { Body, ConflictException, createParamDecorator, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Patch, Post, UnauthorizedException, ValidationPipe } from 'next-api-decorators';
import { getToken } from 'next-auth/jwt';

class ServerUser {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  @IsNotEmpty()
  public hashedPassword: string = '';
}

class ClientUser {
  @IsNotEmpty()
  public id: string = '';
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
}

class SessionUser {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
}

class SignUpPayload {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  @IsNotEmpty()
  public password: string = '';
}

class EditProfilePayload {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  public password?: string;
}

const AuthUserId = createParamDecorator<Promise<string>>(async (req: NextApiRequest): Promise<string> => {
  const token = await getToken({ req });

  if (!token) {
    throw new UnauthorizedException('Must be authenticated.');
  }

  const { id } = token;

  return id;
});

export class UserHandler {
  @Get('/session')
  @HttpCode(200)
  async readSessionUser(@AuthUserId() authUserId: string): Promise<SessionUser> {
    const client = await MongoClient.connect(buildMongoUrl());

    const user = await client.db().collection<ServerUser>('users').findOne({
      _id: new ObjectId(authUserId)
    });

    await client.close();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const { firstName, lastName, email } = user;

    return {
      firstName,
      lastName,
      email
    };
  }

  @Get('/:userId')
  @HttpCode(200)
  async readUserById(@Param('userId') id: string): Promise<ClientUser> {
    const client = await MongoClient.connect(buildMongoUrl());

    const user = await client.db().collection<ServerUser>('users').findOne({
      _id: new ObjectId(id)
    });

    await client.close();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const { firstName, lastName } = user;

    return {
      id,
      firstName,
      lastName
    };
  }

  @Patch()
  @HttpCode(200)
  async updateUser(@Body(ValidationPipe) body: EditProfilePayload, @AuthUserId() authUserId: string): Promise<IdResponse> {
    const { firstName, lastName, email, password } = body;

    const client = await MongoClient.connect(buildMongoUrl());

    const userCollection = client.db().collection<ServerUser>('users');

    const _id = new ObjectId(authUserId);

    const authUser = await userCollection.findOne({
      _id
    });

    if (!authUser) {
      throw new NotFoundException('Authenticated user not found.');
    }

    authUser.firstName = firstName;
    authUser.lastName = lastName;
    authUser.email = email;
    if (password) {
      authUser.hashedPassword = await hash(password, 12);
    }

    const collision = await userCollection.findOne({
      email,
      _id: { $ne: _id }
    });

    if (collision) {
      await client.close();

      throw new ConflictException('Email already in use.');
    }

    const result = await userCollection.updateOne({
      _id
    }, {
      $set: authUser
    });

    await client.close();

    if (!result.acknowledged || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0) {
      throw new InternalServerErrorException('Database failed to update user.');
    }

    return { id: authUserId };
  }

  @Post()
  @HttpCode(204)
  async createUser(@Body(ValidationPipe) body: SignUpPayload): Promise<void> {
    const { firstName, lastName, email, password } = body;

    const client = await MongoClient.connect(buildMongoUrl());

    const userCollection = client.db().collection<ServerUser>('users');

    const collision = await userCollection.findOne({
      email
    });

    if (collision) {
      await client.close();

      throw new ConflictException('Email already in use.');
    }

    const hashedPassword = await hash(password, 12);

    const result = await userCollection.insertOne({
      firstName,
      lastName,
      email,
      hashedPassword
    });

    await client.close();

    if (!result.acknowledged || !result.insertedId) {
      throw new InternalServerErrorException('Database failed to create new user.');
    }
  }
};
