import { AuthUserId } from '@/auth-back-end/decorators';
import { MongoDatabase } from '@/common-back-end/classes';
import { IdResponse } from '@/common-back-end/types';
import { ClientUser, EditProfilePayload, ServerUser, SessionUser, SignUpPayload } from '@/user-back-end/types';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { Body, ConflictException, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Patch, Post, ValidationPipe } from 'next-api-decorators';

export class UserHandler {
  private mongoDatabase: MongoDatabase = new MongoDatabase();

  @Get('/session')
  @HttpCode(200)
  async readSessionUser(@AuthUserId() authUserId: string): Promise<SessionUser> {
    const db = await this.mongoDatabase.getDb();

    const user = await db.collection<ServerUser>('users').findOne({
      _id: new ObjectId(authUserId)
    });

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

  @Get('/:id')
  @HttpCode(200)
  async readUserById(@Param('id') id: string): Promise<ClientUser> {
    const db = await this.mongoDatabase.getDb();

    const user = await db.collection<ServerUser>('users').findOne({
      _id: new ObjectId(id)
    });

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

    const db = await this.mongoDatabase.getDb();

    const userCollection = db.collection<ServerUser>('users');

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
      throw new ConflictException('Email already in use.');
    }

    const result = await userCollection.updateOne({
      _id
    }, {
      $set: authUser
    });

    if (!result.acknowledged || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0 || result.upsertedId !== null) {
      throw new InternalServerErrorException('Database failed to update user.');
    }

    return { id: authUserId };
  }

  @Post()
  @HttpCode(204)
  async createUser(@Body(ValidationPipe) body: SignUpPayload): Promise<void> {
    const { firstName, lastName, email, password } = body;

    const db = await this.mongoDatabase.getDb();

    const userCollection = db.collection<ServerUser>('users');

    const collision = await userCollection.findOne({
      email
    });

    if (collision) {
      throw new ConflictException('Email already in use.');
    }

    const hashedPassword = await hash(password, 12);

    const result = await userCollection.insertOne({
      firstName,
      lastName,
      email,
      hashedPassword
    });

    if (!result.acknowledged || !result.insertedId) {
      throw new InternalServerErrorException('Database failed to create new user.');
    }
  }
};
