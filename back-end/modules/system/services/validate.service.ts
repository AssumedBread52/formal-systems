import { BaseValidateService } from '@/common/services/base-validate.service';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { SystemUniqueTitleException } from '@/system/exceptions/system-unique-title.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(MongoSystemEntity) private systemRepository: MongoRepository<MongoSystemEntity>) {
    super();
  }

  async conflictCheck(title: string, createdByUserId: ObjectId): Promise<void> {
    const collision = await this.systemRepository.findOneBy({
      title,
      createdByUserId
    });

    if (collision) {
      throw new SystemUniqueTitleException();
    }
  }
};
