import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { NewSystemPayload } from './data-transfer-objects/new-system.payload';
import { SystemEntity } from './system.entity';

@Injectable()
export class SystemService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>) {
  }

  async checkForConflict(urlPath: string): Promise<void> {
    const collision = await this.systemRepository.findOneBy({
      urlPath
    });

    if (collision) {
      throw new ConflictException('Systems must have a unique URL path.');
    }
  }

  async create(system: NewSystemPayload, sessionUserId: ObjectId): Promise<SystemEntity> {
    const { title, description } = system;
    const urlPath = encodeURIComponent(title);

    await this.checkForConflict(urlPath);

    const { identifiers } = await this.systemRepository.insert({
      title,
      urlPath,
      description,
      createdByUserId: sessionUserId
    });

    const { _id } = identifiers[0];

    return {
      _id,
      title,
      urlPath,
      description,
      createdByUserId: sessionUserId
    };
  }
};
