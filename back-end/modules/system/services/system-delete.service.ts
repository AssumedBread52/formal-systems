import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { SystemReadService } from './system-read.service';

@Injectable()
export class SystemDeleteService {
  constructor(private systemReadService: SystemReadService, @InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>) {
  }

  async delete(sessionUserId: ObjectId, systemId: any): Promise<SystemEntity> {
    const system = await this.systemReadService.readById(systemId);

    const { createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    return this.systemRepository.remove(system);
  }
};
