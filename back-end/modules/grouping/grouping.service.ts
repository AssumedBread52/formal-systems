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

  private async checkForConflict(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.groupingRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new ConflictException('Groupings under the same parent must have unique titles.');
    }
  }

  async create(newGroupingPayload: NewGroupingPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<GroupingEntity> {
    const { title, description, parentId: parentId = null } = newGroupingPayload;

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

  async update(grouping: GroupingEntity, editGroupingPayload: EditGroupingPayload): Promise<GroupingEntity> {
    const { newTitle, newDescription, newParentId: newParentId = null } = editGroupingPayload;
    const { _id, title, systemId } = grouping;

    if (title !== newTitle) {
      await this.checkForConflict(newTitle, systemId);
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
    } else {
      grouping.ancestorIds = [];
    }
    grouping.parentId = newParentId;

    return this.groupingRepository.save(grouping);
  }

  async delete(grouping: GroupingEntity): Promise<GroupingEntity> {
    const { _id } = grouping;

    const subgroupings = await this.groupingRepository.findBy({
      ancestorIds: _id
    });

    const newSubgroupings = subgroupings.map((subgrouping: GroupingEntity): GroupingEntity => {
      subgrouping.ancestorIds = subgrouping.ancestorIds.filter((ancestorId: ObjectId): boolean => {
        return _id !== ancestorId;
      });

      if (subgrouping.parentId === _id) {
        if (subgrouping.ancestorIds.length > 0) {
          subgrouping.parentId = subgrouping.ancestorIds[subgrouping.ancestorIds.length - 1];
        } else {
          subgrouping.parentId = null;
        }
      }

      return subgrouping;
    });

    if (newSubgroupings.length > 0) {
      await this.groupingRepository.save(newSubgroupings);
    }

    return this.groupingRepository.remove(grouping);
  }
};
