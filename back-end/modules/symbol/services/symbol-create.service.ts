import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemReadService } from '@/system/services/system-read.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SymbolCreateService {
  constructor(private systemReadService: SystemReadService, private validateService: ValidateService, @InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
  }

  async create(sessionUserId: ObjectId, systemId: any, payload: any): Promise<SymbolEntity> {
    const system = await this.systemReadService.readById(systemId);

    const { _id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const newSymbolPayload = this.validateService.payloadCheck(payload, NewSymbolPayload);

    const { title, description, type, content } = newSymbolPayload;

    await this.validateService.conflictCheck(title, _id);

    const symbol = new SymbolEntity();

    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = _id;
    symbol.createdByUserId = sessionUserId;

    return this.symbolRepository.save(symbol);
  }
};
