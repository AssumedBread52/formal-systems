import { BaseValidateService } from '@/common/services/base-validate.service';
import { SymbolUniqueTitleException } from '@/symbol/exceptions/symbol-unique-title.exception';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
    super();
  }

  async conflictCheck(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.symbolRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new SymbolUniqueTitleException();
    }
  }
};
