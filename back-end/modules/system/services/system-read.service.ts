import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SystemReadService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>, private validateService: ValidateService) {
  }

  async readById(systemId: any): Promise<SystemEntity> {
    const system = await this.systemRepository.findOneBy({
      _id: this.validateService.idCheck(systemId)
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    return system;
  }
};
