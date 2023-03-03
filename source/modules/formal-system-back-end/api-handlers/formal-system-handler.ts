import { AuthUserId } from '@/auth-back-end/decorators';
import { buildMongoUrl } from '@/common-back-end/helpers';
import { IdResponse } from '@/common-back-end/types';
import { buildUrlPath } from '@/formal-system-back-end/helpers';
import { ClientFormalSystem, NewFormalSystemPayload, PaginatedResults, ServerFormalSystem, UpdateFormalSystemPayload } from '@/formal-system-back-end/types';
import { MongoClient, ObjectId, WithId } from 'mongodb';
import { Body, ConflictException, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, ParseNumberPipe, Patch, Post, Query, UnauthorizedException, ValidationPipe } from 'next-api-decorators';

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

  @Get()
  @HttpCode(200)
  async readFormalSystems(@Query('page', ParseNumberPipe) page: number, @Query('count', ParseNumberPipe) count: number, @Query('keywords') keywords?: string[] | string): Promise<PaginatedResults<ClientFormalSystem>> {
    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    let formalSystemsCursor
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

    formalSystemsCursor.skip((page - 1) * count).limit(count);

    const formalSystems = await formalSystemsCursor.toArray();

    await client.close();

    return {
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
    };
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
