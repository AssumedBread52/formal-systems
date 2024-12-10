import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SystemPayload } from './payloads/system.payload';
import { SystemCreateService } from './services/system-create.service';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
import { SystemUpdateService } from './services/system-update.service';
import { SystemEntity } from './system.entity';

@Controller('system')
export class SystemController {
  constructor(private systemCreateService: SystemCreateService, private systemDeleteService: SystemDeleteService, private systemReadService: SystemReadService, private systemUpdateService: SystemUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':systemId')
  async deleteSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string): Promise<SystemPayload> {
    const deletedSystem = await this.systemDeleteService.delete(sessionUserId, systemId);

    return new SystemPayload(deletedSystem);
  }

  @Get()
  async getSystems(@Query() payload: any): Promise<PaginatedResultsPayload<SystemEntity, SystemPayload>> {
    const [results, total] = await this.systemReadService.readSystems(payload);

    return new PaginatedResultsPayload(SystemPayload, results, total);
  }

  @Get(':systemId')
  async getById(@Param('systemId') systemId: string): Promise<SystemPayload> {
    const system = await this.systemReadService.readById(systemId);

    return new SystemPayload(system);
  }

  @UseGuards(JwtGuard)
  @Patch(':systemId')
  async patchSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<SystemPayload> {
    const updatedSystem = await this.systemUpdateService.update(sessionUserId, systemId, payload);

    return new SystemPayload(updatedSystem);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Body() payload: any): Promise<SystemPayload> {
    const createdSystem = await this.systemCreateService.create(sessionUserId, payload);

    return new SystemPayload(createdSystem);
  }
};
