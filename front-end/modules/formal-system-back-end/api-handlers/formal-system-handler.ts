import { AuthUserId } from '@/auth-back-end/decorators';
import { MongoCollection } from '@/common-back-end/classes';
import { IdResponse } from '@/common-back-end/types';
import { buildUrlPath } from '@/formal-system-back-end/helpers';
import { ClientFormalSystem, NewFormalSystemPayload, PaginatedResults, ServerFormalSystem, UpdateFormalSystemPayload } from '@/formal-system-back-end/types';
import { ObjectId, WithId } from 'mongodb';
import { Body, ConflictException, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, ParseNumberPipe, Patch, Post, Query, UnauthorizedException, ValidationPipe } from 'next-api-decorators';

export class FormalSystemHandler {
  private formalSystemCollection: MongoCollection<ServerFormalSystem> = new MongoCollection<ServerFormalSystem>('formal-systems');

  @Delete('/:id')
  @HttpCode(200)
  async deleteFormalSystem(@Param('id') id: string, @AuthUserId() createdByUserId: string): Promise<IdResponse> {
    const _id = new ObjectId(id);

    const target = await this.formalSystemCollection.findOne({
      _id
    });

    if (target) {
      if (target.createdByUserId !== createdByUserId) {
        throw new UnauthorizedException('You cannot delete another user\'s data');
      }

      await this.formalSystemCollection.deleteOne({
        _id
      });
    }

    return { id };
  }

  @Get('/:urlPath')
  @HttpCode(200)
  async readFormalSystemByUrlPath(@Param('urlPath') urlPath: string): Promise<ClientFormalSystem> {
    const formalSystem = await this.formalSystemCollection.findOne({
      urlPath
    });

    if (!formalSystem) {
      throw new NotFoundException('Formal system not found.');
    }

    const { _id, title, description, createdByUserId } = formalSystem;

    return {
      id: _id.toString(),
      title,
      urlPath,
      description,
      createdByUserId
    };
  }

  @Get()
  @HttpCode(200)
  async readFormalSystems(@Query('page', ParseNumberPipe) page: number, @Query('count', ParseNumberPipe) count: number, @Query('keywords') keywords?: string[] | string): Promise<PaginatedResults<ClientFormalSystem>> {
    const formalSystemCollection = await this.formalSystemCollection.getCollection();

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

    const formalSystemCollection = await this.formalSystemCollection.getCollection();

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
      throw new ConflictException('URL path already in use.');
    }

    const result = await formalSystemCollection.updateOne({
      _id
    }, {
      $set: formalSystem
    });

    console.log(result);

    if (!result.acknowledged || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0 || result.upsertedId !== null) {
      throw new InternalServerErrorException('Database failed to update formal system.');
    }

    return { id };
  }

  @Post()
  @HttpCode(204)
  async createFormalSystem(@Body(ValidationPipe) body: NewFormalSystemPayload, @AuthUserId() createdByUserId: string): Promise<void> {
    const { title, description } = body;

    const formalSystemCollection = await this.formalSystemCollection.getCollection();

    const urlPath = buildUrlPath(title);

    const collision = await formalSystemCollection.findOne({
      urlPath
    });

    if (collision) {
      throw new ConflictException('URL path already in use.');
    }

    const result = await formalSystemCollection.insertOne({
      title,
      urlPath,
      description,
      createdByUserId
    });

    if (!result.acknowledged || !result.insertedId) {
      throw new InternalServerErrorException('Database failed to create new formal system.');
    }
  }
};
