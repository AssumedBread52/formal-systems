import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { GroupingEntity } from './grouping.entity';
import { EditGroupingPayload } from './payloads/edit-grouping.payload';
import { NewGroupingPayload } from './payloads/new-grouping.payload';

@Injectable()
export class GroupingService {
  constructor(@InjectRepository(GroupingEntity) private groupingRepository: MongoRepository<GroupingEntity>) {
  }

  private async checkForConflict(title: string, parentId: ObjectId | null): Promise<void> {
    const collision = await this.groupingRepository.findOneBy({
      title,
      parentId
    });

    if (collision) {
      throw new ConflictException('Groupings under the same parent must have unique titles.');
    }
  }

  async create(newGroupingPayload: NewGroupingPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<GroupingEntity> {
    const { title, description, parentId: parentId = null } = newGroupingPayload;

    await this.checkForConflict(title, parentId);

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

  async update(grouping: GroupingEntity, editGroupingPayload: EditGroupingPayload): Promise<GroupingEntity> {
    const { newTitle, newDescription, newParentId: newParentId = null } = editGroupingPayload;
    const { _id, title, parentId, systemId } = grouping;

    if (title !== newTitle || parentId !== newParentId) {
      await this.checkForConflict(newTitle, newParentId);
    }

    grouping.title = newTitle;
    grouping.description = newDescription;
    if (newParentId) {
      const newParent = await this.groupingRepository.findOneBy({
        _id: newParentId,
        systemId
      });

      if (!newParent) {
        throw new NotFoundException('New parent not found within the formal system.');
      }

      const newAncestorIds = newParent.ancestorIds.concat([newParentId]);

      if (newAncestorIds.includes(_id)) {
        throw new ConflictException('Groupings cannot be included in their own groupings or subgroupings.');
      }

      grouping.ancestorIds = newAncestorIds;
    }
    grouping.parentId = newParentId;

    return this.groupingRepository.save(grouping);
  }
};
