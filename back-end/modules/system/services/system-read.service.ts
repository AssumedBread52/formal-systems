import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SearchPayload } from '@/system/payloads/search.payload';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
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

  readSystems(payload: any): Promise<[SystemEntity[], number]> {
    const searchPayload = this.validateService.payloadCheck(payload, SearchPayload);

    const where = {} as RootFilterOperators<SystemEntity>;
    const { page, count, keywords, userIds } = searchPayload;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds.map((userId: string): ObjectId => {
          return new ObjectId(userId);
        })
      };
    }

    return this.systemRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }
};
