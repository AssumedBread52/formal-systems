import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { SystemEntity } from './system.entity';

@Injectable()
export class SystemService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>) {
  }

  readById(systemId: ObjectId): Promise<SystemEntity | null> {
    return this.systemRepository.findOneBy({
      _id: systemId
    });
  }

  readSystems(page: number, count: number, keywords: string[], userIds: ObjectId[]): Promise<[SystemEntity[], number]> {
    const where = {} as RootFilterOperators<SystemEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds
      };
    }

    return this.systemRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }
};
