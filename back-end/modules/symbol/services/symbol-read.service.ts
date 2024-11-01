import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SymbolReadService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>, private validateService: ValidateService) {
  }

  async readById(systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.symbolRepository.findOneBy({
      _id: this.validateService.idCheck(symbolId),
      systemId: this.validateService.idCheck(systemId)
    });

    if (!symbol) {
      throw new SymbolNotFoundException();
    }

    return symbol;
  }
};
