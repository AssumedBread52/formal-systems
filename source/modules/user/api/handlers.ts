import { buildMongoUrl } from '@/common/helpers';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MongoClient, ObjectId } from 'mongodb';
import type { NextApiRequest } from 'next';
import { Get, HttpCode, NotFoundException, Param, Request, UnauthorizedException } from 'next-api-decorators';
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

export class UserHandler {
  @Get('/session')
  @HttpCode(200)
  async fetchSessionUser(@Request() req: NextApiRequest): Promise<SessionUser> {
    const token = await getToken({ req });

    if (!token) {
      throw new UnauthorizedException('No session found.');
    }

    const { id } = token;

    const client = await MongoClient.connect(buildMongoUrl());

    const user = await client.db().collection<ServerUser>('users').findOne({
      _id: new ObjectId(id)
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
  async fetchUserById(@Param('userId') id: string): Promise<ClientUser> {
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
};