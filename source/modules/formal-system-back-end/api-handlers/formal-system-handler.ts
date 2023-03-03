import { AuthUserId } from '@/auth-back-end/decorators';
import { buildMongoUrl } from '@/common-back-end/helpers';
import { IdResponse } from '@/common-back-end/types';
import { buildUrlPath } from '@/formal-system-back-end/helpers';
import { NewFormalSystemPayload, ServerFormalSystem, UpdateFormalSystemPayload } from '@/formal-system-back-end/types';
import { MongoClient, ObjectId } from 'mongodb';
import { Body, ConflictException, Delete, HttpCode, InternalServerErrorException, NotFoundException, Param, Patch, Post, UnauthorizedException, ValidationPipe } from 'next-api-decorators';

export class FormalSystemHandler {
  @Delete('/:id')
  @HttpCode(200)
  async deleteFormalSystem(@Param('id') id: string, @AuthUserId() createdByUserId: string): Promise<IdResponse> {
    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    const _id = new ObjectId(id);

    const target = await formalSystemCollection.findOne({
      _id
    });

    if (target) {
      if (target.createdByUserId !== createdByUserId) {
        await client.close();

        throw new UnauthorizedException('You cannot delete another user\'s data');
      }

      const result = await formalSystemCollection.deleteOne({
        _id
      });

      await client.close();

      if (!result.acknowledged || result.deletedCount !== 1) {
        throw new InternalServerErrorException('Database failed to delete formal system.');
      }
    } else {
      await client.close();
    }

    return { id };
  }

  @Patch('/:id')
  @HttpCode(200)
  async updateFormalSystem(@Body(ValidationPipe) body: UpdateFormalSystemPayload, @Param('id') id: string, @AuthUserId() createdByUserId: string): Promise<IdResponse> {
    const { title, description } = body;

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
