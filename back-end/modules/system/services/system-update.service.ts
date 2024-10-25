import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { SystemReadService } from './system-read.service';
import { ValidateService } from './validate.service';

@Injectable()
export class SystemUpdateService {
  constructor(private systemReadService: SystemReadService, @InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>, private validateService: ValidateService) {
  }

  async update(sessionUserId: ObjectId, systemId: any, payload: any): Promise<SystemEntity> {
    const system = await this.systemReadService.readById(systemId);

    const { title, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const editSystemPayload = this.validateService.payloadCheck(payload, EditSystemPayload);

    const { newTitle, newDescription } = editSystemPayload;

    if (title !== newTitle) {
      await this.validateService.conflictCheck(newTitle, sessionUserId);
    }

    system.title = newTitle;
    system.description = newDescription;

    return this.systemRepository.save(system);
  }
};
