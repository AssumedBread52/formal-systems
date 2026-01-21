import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemService } from '@/system/services/system.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Delete(':systemId')
  deleteSystem(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemService.delete(sessionUserId, systemId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getSystems(@Query() payload: any): Promise<PaginatedResultsPayload<SystemEntity>> {
    return this.systemService.readSystems(payload);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':systemId')
  getById(@Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemService.readById(systemId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Patch(':systemId')
  patchSystem(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body() payload: any): Promise<SystemEntity> {
    return this.systemService.update(sessionUserId, systemId, payload);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Post()
  postSystem(@SessionUser('id') sessionUserId: string, @Body() payload: any): Promise<SystemEntity> {
    return this.systemService.create(sessionUserId, payload);
  }
};
