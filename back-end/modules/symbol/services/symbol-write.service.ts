import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { UniqueNameException } from '@/symbol/exceptions/unique-name.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SymbolWriteService {
  public constructor(private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(SymbolEntity) private readonly repository: Repository<SymbolEntity>) {
  }

  public async create(userId: string, systemId: string, newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    try {
      const validatedNewSymbolPayload = validatePayload(newSymbolPayload, NewSymbolPayload);

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      const nameConflict = await this.repository.existsBy({
        systemId: system.id,
        name: validatedNewSymbolPayload.name
      });

      if (nameConflict) {
        throw new UniqueNameException();
      }

      const symbol = new SymbolEntity();

      symbol.systemId = system.id;
      symbol.name = validatedNewSymbolPayload.name;
      symbol.description = validatedNewSymbolPayload.description;
      symbol.type = validatedNewSymbolPayload.type;
      symbol.content = validatedNewSymbolPayload.content;

      const savedSymbol = await this.repository.save(symbol);

      return validatePayload(savedSymbol, SymbolEntity);
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

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      const deletedSymbol = await this.repository.remove(symbol);

      deletedSymbol.id = symbolId;

      return validatePayload(deletedSymbol, SymbolEntity);
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

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      if (validatedEditSymbolPayload.newName !== symbol.name) {
        const nameConflict = await this.repository.existsBy({
          systemId,
          name: validatedEditSymbolPayload.newName
        });

        if (nameConflict) {
          throw new UniqueNameException();
        }
      }

      symbol.name = validatedEditSymbolPayload.newName;
      symbol.description = validatedEditSymbolPayload.newDescription;
      symbol.type = validatedEditSymbolPayload.newType;
      symbol.content = validatedEditSymbolPayload.newContent;

      const updatedSymbol = await this.repository.save(symbol);

      return validatePayload(updatedSymbol, SymbolEntity);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol failed');
    }
  }
};
