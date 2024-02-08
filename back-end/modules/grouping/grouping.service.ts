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

  async update(grouping: GroupingEntity, editGroupingPayload: EditGroupingPayload): Promise<GroupingEntity> {
    const { newTitle, newDescription, newParentId = null } = editGroupingPayload;
    const { _id, title, parentId, systemId } = grouping;

    if (title !== newTitle) {
      await this.checkForConflict(newTitle, systemId);
    }

    grouping.title = newTitle;
    grouping.description = newDescription;
    if (newParentId?.toString() !== parentId?.toString()) {
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
          throw new ConflictException('Groupings cannot be their own descendants.');
        }

        grouping.ancestorIds = newAncestorIds;
      } else {
        grouping.ancestorIds = [];
      }

      const subgroupings = await this.groupingRepository.findBy({
        ancestorIds: _id
      });

      if (subgroupings.length > 0) {
        const newSubgroupings = subgroupings.map((subgrouping: GroupingEntity): GroupingEntity => {
          const groupingIndex = subgrouping.ancestorIds.findIndex((ancestorId: ObjectId): boolean => {
            return _id.toString() === ancestorId.toString();
          });

          subgrouping.ancestorIds = grouping.ancestorIds.concat(subgrouping.ancestorIds.slice(groupingIndex));

          return subgrouping;
        });

        await this.groupingRepository.save(newSubgroupings);
      }
    }
    grouping.parentId = newParentId;

    return this.groupingRepository.save(grouping);
  }
};
