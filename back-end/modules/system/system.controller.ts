import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { SystemEntity } from './entities/system.entity';
import { SystemCreateService } from './services/system-create.service';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
import { SystemUpdateService } from './services/system-update.service';

@Controller('system')
export class SystemController {
  constructor(private systemCreateService: SystemCreateService, private systemDeleteService: SystemDeleteService, private systemReadService: SystemReadService, private systemUpdateService: SystemUpdateService) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Delete(':systemId')
  deleteSystem(@SessionUserDecorator('id') sessionUserId: string, @Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemDeleteService.delete(sessionUserId, systemId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getSystems(@Query() payload: any): Promise<PaginatedResultsPayload<SystemEntity>> {
    return this.systemReadService.readSystems(payload);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':systemId')
  getById(@Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemReadService.readById(systemId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Patch(':systemId')
  patchSystem(@SessionUserDecorator('id') sessionUserId: string, @Param('systemId') systemId: string, @Body() payload: any): Promise<SystemEntity> {
    return this.systemUpdateService.update(sessionUserId, systemId, payload);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Post()
  postSystem(@SessionUserDecorator('id') sessionUserId: string, @Body() payload: any): Promise<SystemEntity> {
    return this.systemCreateService.create(sessionUserId, payload);
  }
};
