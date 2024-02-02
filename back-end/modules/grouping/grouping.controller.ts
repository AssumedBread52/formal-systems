import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { SystemService } from '@/system/system.service';
import { Body, Controller, Delete, ForbiddenException, NotFoundException, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GroupingService } from './grouping.service';
import { EditGroupingPayload } from './payloads/edit-grouping.payload';
import { NewGroupingPayload } from './payloads/new-grouping.payload';

@Controller('system/:systemId/grouping')
export class GroupingController {
  constructor(private groupingService: GroupingService, private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':groupingId')
  async deleteGrouping(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('groupingId') groupingId: ObjectId): Promise<IdPayload> {
    const grouping = await this.groupingService.readById(systemId, groupingId);

    if (!grouping) {
      return new IdPayload(groupingId);
    }

    const { createdByUserId } = grouping;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot delete a grouping unless you created it.');
    }

    await this.groupingService.delete(grouping);

    return new IdPayload(groupingId);
  }

  @UseGuards(JwtGuard)
  @Patch(':groupingId')
  async patchGrouping(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('groupingId') groupingId: ObjectId, @Body(ValidationPipe) editGroupingPayload: EditGroupingPayload): Promise<IdPayload> {
    const { newParentId } = editGroupingPayload;

    if (newParentId) {
      editGroupingPayload.newParentId = new ObjectId(newParentId);
    }

    const grouping = await this.groupingService.readById(systemId, groupingId);

    if (!grouping) {
      throw new NotFoundException('Grouping not found.');
    }

    const { createdByUserId } = grouping;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot update a grouping unless you created it.');
    }

    await this.groupingService.update(grouping, editGroupingPayload);

    return new IdPayload(groupingId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postGrouping(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newGroupingPayload: NewGroupingPayload): Promise<void> {
    const { parentId } = newGroupingPayload;

    if (parentId) {
      newGroupingPayload.parentId = new ObjectId(parentId);
    }

    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Groupings cannot be added to formal systems that do not exist.');
    }

    const { createdByUserId } = system;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('Groupings cannot be added to formal systems unless you created them.');
    }

    await this.groupingService.create(newGroupingPayload, systemId, sessionUserId);
  }
};
