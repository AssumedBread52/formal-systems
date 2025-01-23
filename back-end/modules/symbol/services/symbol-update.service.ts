import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { SymbolReadService } from './symbol-read.service';
import { ValidateService } from './validate.service';

@Injectable()
export class SymbolUpdateService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>, private symbolReadService: SymbolReadService, private validateService: ValidateService) {
  }

  async update(sessionUserId: ObjectId, containingSystemId: any, symbolId: any, payload: any): Promise<SymbolEntity> {
    const symbol = await this.symbolReadService.readById(containingSystemId, symbolId);

    const { title, type, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, proofAppearanceCount, systemId, createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const editSymbolPayload = this.validateService.payloadCheck(payload, EditSymbolPayload);

    const { newTitle, newDescription, newType, newContent } = editSymbolPayload;

    if (title !== newTitle) {
      await this.validateService.conflictCheck(newTitle, systemId);
    }

    if (type !== newType && (axiomAppearanceCount > 0 || theoremAppearanceCount > 0 || deductionAppearanceCount > 0 || proofAppearanceCount > 0)) {
      throw new InUseException();
    }

    symbol.title = newTitle;
    symbol.description = newDescription;
    symbol.type = newType;
    symbol.content = newContent;

    return this.symbolRepository.save(symbol);
  }
};
