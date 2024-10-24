import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SystemNotFoundException } from './exceptions/system-not-found.exception';
import { EditSystemPayload } from './payloads/edit-system.payload';
import { NewSystemPayload } from './payloads/new-system.payload';
import { SearchPayload } from './payloads/search.payload';
import { SystemPayload } from './payloads/system.payload';
import { SystemReadService } from './services/system-read.service';
import { SystemEntity } from './system.entity';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private systemReadService: SystemReadService, private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':systemId')
  async deleteSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId): Promise<IdPayload> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      return new IdPayload(systemId);
    }

    const { createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    await this.systemService.delete(system);

    return new IdPayload(systemId);
  }

  @Get()
  async getSystems(@Query(new ValidationPipe({ transform: true })) searchPayload: SearchPayload): Promise<PaginatedResultsPayload<SystemEntity, SystemPayload>> {
    const { page, count, keywords, userIds } = searchPayload;

    const [results, total] = await this.systemService.readSystems(page, count, keywords, userIds);

    return new PaginatedResultsPayload(SystemPayload, results, total);
  }

  @Get(':systemId')
  async getById(@Param('systemId') systemId: string): Promise<SystemPayload> {
    const system = await this.systemReadService.readById(systemId);

    return new SystemPayload(system);
  }

  @UseGuards(JwtGuard)
  @Patch(':systemId')
  async patchSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) editSystemPayload: EditSystemPayload): Promise<IdPayload> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new SystemNotFoundException();
    }

    const { createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    await this.systemService.update(system, editSystemPayload);

    return new IdPayload(systemId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Body(ValidationPipe) newSystemPayload: NewSystemPayload): Promise<void> {
    await this.systemService.create(newSystemPayload, sessionUserId);
  }
};
