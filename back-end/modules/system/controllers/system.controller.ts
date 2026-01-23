import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { SystemService } from '@/system/services/system.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @Delete(':systemId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public deleteSystem(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string): Promise<SystemEntity> {
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

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postSystem(@SessionUser('id') sessionUserId: string, @Body(new ValidationPipe({ transform: true })) newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    return this.systemService.create(sessionUserId, newSystemPayload);
  }
};
