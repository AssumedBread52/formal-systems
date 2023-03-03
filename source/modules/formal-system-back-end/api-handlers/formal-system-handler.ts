import { AuthUserId } from '@/auth-back-end/decorators';
import { buildUrlPath } from '@/formal-system-back-end/helpers';
import { NewFormalSystemPayload, ServerFormalSystem } from '@/formal-system-back-end/types';
import { buildMongoUrl } from '@/user-back-end/helpers';
import { MongoClient } from 'mongodb';
import { Body, ConflictException, HttpCode, InternalServerErrorException, Post, ValidationPipe } from 'next-api-decorators';

export class FormalSystemHandler {
  @Post()
  @HttpCode(204)
  async createFormalSystem(@Body(ValidationPipe) body: NewFormalSystemPayload, @AuthUserId() createdByUserId: string): Promise<void> {
    const { title, description } = body;

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    const urlPath = buildUrlPath(title);

    const collision = await formalSystemCollection.findOne({
      urlPath
    });

    if (collision) {
      await client.close();

      throw new ConflictException('URL path already in use.');
    }

    const result = await formalSystemCollection.insertOne({
      title,
      urlPath,
      description,
      createdByUserId
    });

    await client.close();

    if (!result.acknowledged || !result.insertedId) {
      throw new InternalServerErrorException('Database failed to create new formal system.');
    }
  }
};
