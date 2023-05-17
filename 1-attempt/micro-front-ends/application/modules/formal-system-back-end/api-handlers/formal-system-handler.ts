import { MongoCollection } from '@/common-back-end/classes';
import { ClientFormalSystem, ServerFormalSystem } from '@/formal-system-back-end/types';
import { Get, HttpCode, NotFoundException, Param } from 'next-api-decorators';

export class FormalSystemHandler {
  private formalSystemCollection: MongoCollection<ServerFormalSystem> = new MongoCollection<ServerFormalSystem>('systems');

  @Get('/:urlPath')
  @HttpCode(200)
  async readFormalSystemByUrlPath(@Param('urlPath') urlPath: string): Promise<ClientFormalSystem> {
    const formalSystem = await this.formalSystemCollection.findOne({
      urlPath: encodeURIComponent(urlPath)
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
};
