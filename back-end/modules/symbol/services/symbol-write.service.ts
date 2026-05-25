import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SystemReadService } from '@/system/services/system-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SymbolReadService } from './symbol-read.service';

@Injectable()
export class SymbolWriteService {
  public constructor(private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, @InjectRepository(SymbolEntity) private readonly repository: Repository<SymbolEntity>) {
  }

  public async create(userId: string, systemId: string, newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    try {
      const validatedNewSymbolPayload = validatePayload(newSymbolPayload, NewSymbolPayload);

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.symbolReadService.verifyUniqueName(systemId, validatedNewSymbolPayload.name);

      const symbol = new SymbolEntity();

      symbol.systemId = systemId;
      symbol.name = validatedNewSymbolPayload.name;
      symbol.description = validatedNewSymbolPayload.description;
      symbol.type = validatedNewSymbolPayload.type;
      symbol.content = validatedNewSymbolPayload.content;

      return await this.repository.save(symbol);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating symbol failed');
    }
  }

  public async delete(userId: string, systemId: string, symbolId: string): Promise<SymbolEntity> {
    try {
      const symbol = await this.repository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.symbolReadService.verifySymbolNotInUse(symbolId);

      const removedSymbol = await this.repository.remove(symbol);

      removedSymbol.id = symbolId;

      return removedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting symbol failed');
    }
  }

  public async update(userId: string, systemId: string, symbolId: string, editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    try {
      const validatedEditSymbolPayload = validatePayload(editSymbolPayload, EditSymbolPayload);

      const symbol = await this.repository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      if (validatedEditSymbolPayload.name !== undefined && validatedEditSymbolPayload.name !== symbol.name) {
        await this.symbolReadService.verifyUniqueName(systemId, validatedEditSymbolPayload.name);

        symbol.name = validatedEditSymbolPayload.name;
      }

      if (validatedEditSymbolPayload.description !== undefined && validatedEditSymbolPayload.description !== symbol.description) {
        symbol.description = validatedEditSymbolPayload.description;
      }

      if (validatedEditSymbolPayload.content !== undefined && validatedEditSymbolPayload.content !== symbol.content) {
        symbol.content = validatedEditSymbolPayload.content;
      }

      if (validatedEditSymbolPayload.type !== undefined && validatedEditSymbolPayload.type !== symbol.type) {
        const newType = validatedEditSymbolPayload.type;

        return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<SymbolEntity> => {
          const symbolRepository = entityManager.getRepository(SymbolEntity);

          await this.symbolReadService.verifySymbolTypeChangeable(entityManager, symbolId);

          symbol.type = newType;

          return symbolRepository.save(symbol);
        });
      }

      return await this.repository.save(symbol);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol failed');
    }
  }
};
