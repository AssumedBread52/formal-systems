import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemRepository } from '@/system/repositories/system.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SymbolCreateService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>, private systemRepository: SystemRepository, private validateService: ValidateService) {
  }

  async create(sessionUserId: ObjectId, systemId: any, payload: any): Promise<SymbolEntity> {
    const system = await this.systemRepository.findOneBy({
      id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    const { id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const newSymbolPayload = this.validateService.payloadCheck(payload, NewSymbolPayload);

    const { title, description, type, content } = newSymbolPayload;

    await this.validateService.conflictCheck(title, new ObjectId(id));

    const symbol = new SymbolEntity();

    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = new ObjectId(id);
    symbol.createdByUserId = sessionUserId;

    return this.symbolRepository.save(symbol);
  }
};
