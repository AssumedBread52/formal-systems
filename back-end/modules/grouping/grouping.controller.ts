import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { SystemService } from '@/system/system.service';
import { Body, Controller, ForbiddenException, NotFoundException, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GroupingService } from './grouping.service';
import { NewGroupingPayload } from './payloads/new-grouping.payload';

@Controller('system/:systemId/grouping')
export class GroupingController {
  constructor(private groupingService: GroupingService, private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Post()
  async postGrouping(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newGroupingPayload: NewGroupingPayload): Promise<void> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Groupings cannot be added to formal systems that do not exist.');
    }

    const { _id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('Groupings cannot be added to formal systems unless you created them.');
    }

    await this.groupingService.create(newGroupingPayload, _id, sessionUserId);
  }
};
