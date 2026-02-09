import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SystemEntity } from '@/system/entities/system.entity';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { PaginatedSystemsPayload } from '@/system/payloads/paginated-systems.payload';
import { SearchSystemsPayload } from '@/system/payloads/search-systems.payload';
import { SystemReadService } from '@/system/services/system-read.service';
import { SystemWriteService } from '@/system/services/system-write.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system')
export class SystemController {
  public constructor(private readonly systemReadService: SystemReadService, private readonly systemWriteService: SystemWriteService) {
  }

  @Delete(':systemId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public deleteSystem(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemWriteService.delete(sessionUserId, systemId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getSystems(@Query(new ValidationPipe({ transform: true })) searchPayload: SearchSystemsPayload): Promise<PaginatedSystemsPayload> {
    return this.systemReadService.searchSystems(searchPayload);
  }

  @Get(':systemId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemReadService.selectById(systemId);
  }

  @Patch(':systemId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public patchSystem(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body(new ValidationPipe({ transform: true })) editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    return this.systemWriteService.update(sessionUserId, systemId, editSystemPayload);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postSystem(@SessionUser('id') sessionUserId: string, @Body(new ValidationPipe({ transform: true })) newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    return this.systemWriteService.create(sessionUserId, newSystemPayload);
  }
};
