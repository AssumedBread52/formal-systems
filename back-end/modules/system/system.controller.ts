import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SystemEntity } from './entities/system.entity';
import { SystemPayload } from './payloads/system.payload';
import { SystemCreateService } from './services/system-create.service';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
import { SystemUpdateService } from './services/system-update.service';

@Controller('system')
export class SystemController {
  constructor(private systemCreateService: SystemCreateService, private systemDeleteService: SystemDeleteService, private systemReadService: SystemReadService, private systemUpdateService: SystemUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':systemId')
  async deleteSystem(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string): Promise<SystemPayload> {
    const deletedSystem = await this.systemDeleteService.delete(sessionUserId, systemId);

    return new SystemPayload(deletedSystem);
  }

  @Get()
  async getSystems(@Query() payload: any): Promise<PaginatedResultsPayload<SystemEntity>> {
    return this.systemReadService.readSystems(payload);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':systemId')
  async getById(@Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemReadService.readById(systemId);
  }

  @UseGuards(JwtGuard)
  @Patch(':systemId')
  async patchSystem(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<SystemPayload> {
    const updatedSystem = await this.systemUpdateService.update(sessionUserId, systemId, payload);

    return new SystemPayload(updatedSystem);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSystem(@SessionUserDecorator('id') sessionUserId: ObjectId, @Body() payload: any): Promise<SystemPayload> {
    const createdSystem = await this.systemCreateService.create(sessionUserId, payload);

    return new SystemPayload(createdSystem);
  }
};
