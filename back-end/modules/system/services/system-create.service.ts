import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SystemCreateService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>, private validateService: ValidateService) {
  }

  async create(sessionUserId: ObjectId, payload: any): Promise<SystemEntity> {
    const newSystemPayload = this.validateService.payloadCheck(payload, NewSystemPayload);

    const { title, description } = newSystemPayload;

    await this.validateService.conflictCheck(title, sessionUserId);

    const system = new SystemEntity();

    system.title = title;
    system.description = description;
    system.createdByUserId = sessionUserId;

    return this.systemRepository.save(system);
  }
};
