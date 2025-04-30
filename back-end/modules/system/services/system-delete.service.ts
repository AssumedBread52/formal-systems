import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { InUseException } from '@/system/exceptions/in-use.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class SystemDeleteService {
  constructor(@InjectRepository(MongoSystemEntity) private systemRepository: MongoRepository<MongoSystemEntity>) {
  }

  async delete(sessionUserId: ObjectId, systemId: any): Promise<MongoSystemEntity> {
    const system = await this.systemRepository.findOneBy({
      _id: new ObjectId(systemId)
    });

    if (!system) {
      throw new Error();
    }

    const { _id, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (constantSymbolCount > 0 || variableSymbolCount > 0 || axiomCount > 0 || theoremCount > 0 || deductionCount > 0 || proofCount > 0) {
      throw new InUseException();
    }

    await this.systemRepository.remove(system);

    system._id = _id;

    return system;
  }
};
