import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SystemCreateService {
  constructor(@InjectRepository(MongoSystemEntity) private systemRepository: MongoRepository<MongoSystemEntity>, private validateService: ValidateService) {
  }

  async create(sessionUserId: ObjectId, payload: any): Promise<MongoSystemEntity> {
    const newSystemPayload = this.validateService.payloadCheck(payload, NewSystemPayload);

    const { title, description } = newSystemPayload;

    await this.validateService.conflictCheck(title, sessionUserId);

    const system = new MongoSystemEntity();

    system.title = title;
    system.description = description;
    system.createdByUserId = sessionUserId;

    return this.systemRepository.save(system);
  }
};
