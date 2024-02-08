import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { GroupingEntity } from './grouping.entity';
import { NewGroupingPayload } from './payloads/new-grouping.payload';

@Injectable()
export class GroupingService {
  constructor(@InjectRepository(GroupingEntity) private groupingRepository: MongoRepository<GroupingEntity>) {
  }

  private async checkForConflict(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.groupingRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new ConflictException('Groupings within a formal system must have unique titles.');
    }
  }

  async create(newGroupingPayload: NewGroupingPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<GroupingEntity> {
    const { title, description, parentId = null } = newGroupingPayload;

    await this.checkForConflict(title, systemId);

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

      grouping.ancestorIds = parent.ancestorIds.concat([parentId]);
    }
    grouping.parentId = parentId;
    grouping.systemId = systemId;
    grouping.createdByUserId = sessionUserId;

    return this.groupingRepository.save(grouping);
  }

  readById(systemId: ObjectId, groupingId: ObjectId): Promise<GroupingEntity | null> {
    return this.groupingRepository.findOneBy({
      _id: groupingId,
      systemId
    });
  }
};
