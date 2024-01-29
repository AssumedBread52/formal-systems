import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { GroupingEntity } from './grouping.entity';
import { NewGroupingPayload } from './payloads/new-grouping.payload';

@Injectable()
export class GroupingService {
  constructor(@InjectRepository(GroupingEntity) private groupingRepository: MongoRepository<GroupingEntity>) {
  }

  async create(newGroupingPayload: NewGroupingPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<GroupingEntity> {
    const { title, description, parentId } = newGroupingPayload;

    const grouping = new GroupingEntity();

    grouping.title = title;
    grouping.description = description;
    if (parentId) {
      const parent = await this.groupingRepository.findOneBy({
        _id: parentId,
        systemId
      });

      if (!parent) {
        throw new NotFoundException('Parent not found within the formal system.');
      }

      grouping.parentId = parentId;
    }
    grouping.systemId = systemId;
    grouping.createdByUserId = sessionUserId;

    return this.groupingRepository.save(grouping);
  }
};
