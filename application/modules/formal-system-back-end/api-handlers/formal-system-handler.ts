import { AuthUserId } from '@/auth-back-end/decorators';
import { MongoCollection } from '@/common-back-end/classes';
import { IdResponse } from '@/common-back-end/types';
import { buildUrlPath } from '@/formal-system-back-end/helpers';
import { ClientFormalSystem, PaginatedResults, ServerFormalSystem, UpdateFormalSystemPayload } from '@/formal-system-back-end/types';
import { ObjectId, WithId } from 'mongodb';
import { Body, ConflictException, Delete, Get, HttpCode, NotFoundException, Param, ParseNumberPipe, Patch, Query, UnauthorizedException, ValidationPipe } from 'next-api-decorators';

export class FormalSystemHandler {
  private formalSystemCollection: MongoCollection<ServerFormalSystem> = new MongoCollection<ServerFormalSystem>('systems');

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
    let formalSystemsCursor;
    let total;
    if (!keywords || 0 === keywords.length) {
      formalSystemsCursor = await this.formalSystemCollection.find();
      total = await this.formalSystemCollection.countDocuments();
    } else {
      const filter = {
        $text: {
          $caseSensitive: false,
          $search: Array.isArray(keywords) ? keywords.join(',') : keywords
        }
      };

      formalSystemsCursor = await this.formalSystemCollection.find(filter);
      total = await this.formalSystemCollection.countDocuments(filter);
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

    const _id = new ObjectId(id);

    const formalSystem = await this.formalSystemCollection.findOne({
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

    const collision = await this.formalSystemCollection.findOne({
      urlPath,
      _id: { $ne: _id }
    });

    if (collision) {
      throw new ConflictException('URL path already in use.');
    }

    await this.formalSystemCollection.updateOne({
      _id
    }, {
      $set: formalSystem
    });

    return { id };
  }
};
