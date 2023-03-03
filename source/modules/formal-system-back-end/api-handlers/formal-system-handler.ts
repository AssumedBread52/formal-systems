import { AuthUserId } from '@/auth-back-end/decorators';
import { buildUrlPath } from '@/formal-system-back-end/helpers';
import { NewFormalSystemPayload, ServerFormalSystem, UpdateFormalSystemPayload } from '@/formal-system-back-end/types';
import { buildMongoUrl } from '@/user-back-end/helpers';
import { IdResponse } from '@/user-back-end/types';
import { MongoClient, ObjectId } from 'mongodb';
import { Body, ConflictException, HttpCode, InternalServerErrorException, NotFoundException, Patch, Post, ValidationPipe } from 'next-api-decorators';

export class FormalSystemHandler {
  @Patch()
  @HttpCode(200)
  async updateFormalSystem(@Body(ValidationPipe) body: UpdateFormalSystemPayload, @AuthUserId() createdByUserId: string): Promise<IdResponse> {
    const { id, title, description } = body;

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    const _id = new ObjectId(id);

    const formalSystem = await formalSystemCollection.findOne({
      _id,
      createdByUserId
    });

    if (!formalSystem) {
      throw new NotFoundException('Formal System not found.');
    }

    const urlPath = buildUrlPath(title);

    formalSystem.title = title;
    formalSystem.urlPath = urlPath;
    formalSystem.description = description;

    const collision = await formalSystemCollection.findOne({
      urlPath,
      _id: { $ne: _id }
    });

    if (collision) {
      await client.close();

      throw new ConflictException('URL path already in use.');
    }

    const result = await formalSystemCollection.updateOne({
      _id
    }, {
      $set: formalSystem
    });

    console.log(result);

    await client.close();

    if (!result.acknowledged || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0 || result.upsertedId !== null) {
      throw new InternalServerErrorException('Database failed to update formal system.');
    }

    return { id };
  }

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
