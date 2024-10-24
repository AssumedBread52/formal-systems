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

  async readById(id: any): Promise<SystemEntity> {
    const systemId = this.validateService.idCheck(id);

    const system = await this.systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    return system;
  }
};
