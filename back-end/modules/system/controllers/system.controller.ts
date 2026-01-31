import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { SystemService } from '@/system/services/system.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system')
export class SystemController {
  public constructor(private readonly systemService: SystemService) {
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

  @Get(':systemId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemService.selectById(systemId);
  }

  @Patch(':systemId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public patchSystem(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body(new ValidationPipe({ transform: true })) editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    return this.systemService.update(sessionUserId, systemId, editSystemPayload);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postSystem(@SessionUser('id') sessionUserId: string, @Body(new ValidationPipe({ transform: true })) newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    return this.systemService.create(sessionUserId, newSystemPayload);
  }
};
