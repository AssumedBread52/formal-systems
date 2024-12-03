import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InUseException } from '@/system/exceptions/in-use.exception';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { SystemReadService } from './system-read.service';

@Injectable()
export class SystemDeleteService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>, private systemReadService: SystemReadService) {
  }

  async delete(sessionUserId: ObjectId, systemId: any): Promise<SystemEntity> {
    const system = await this.systemReadService.readById(systemId);

    const { _id, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (constantSymbolCount > 0 || variableSymbolCount > 0 || axiomCount > 0 || theoremCount > 0 || deductionCount > 0) {
      throw new InUseException();
    }

    await this.systemRepository.remove(system);

    system._id = _id;

    return system;
  }
};
