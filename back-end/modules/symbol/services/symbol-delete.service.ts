import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { SymbolReadService } from './symbol-read.service';

@Injectable()
export class SymbolDeleteService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>, private symbolReadService: SymbolReadService) {
  }

  async delete(sessionUserId: ObjectId, systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.symbolReadService.readById(systemId, symbolId);

    const { _id, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (axiomAppearanceCount > 0 || theoremAppearanceCount > 0 || deductionAppearanceCount > 0) {
      throw new InUseException();
    }

    await this.symbolRepository.remove(symbol);

    symbol._id = _id;

    return symbol;
  }
};
