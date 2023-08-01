import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EditSystemPayload } from './payloads/edit-system.payload';
import { NewSystemPayload } from './payloads/new-system.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { SystemPayload } from './payloads/system.payload';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
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
      throw new ForbiddenException('You cannot delete a system unless you created it.');
    }

    await this.systemService.delete(system);

    return new IdPayload(systemId);
  }

  @Get()
  getSystems(@Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.systemService.readSystems(page, count, keywords);
  }

  @Get(':systemId')
  async getById(@ObjectIdDecorator('systemId') systemId: ObjectId): Promise<SystemPayload> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('System not found.');
    }

    return new SystemPayload(system);
  }

  @UseGuards(JwtGuard)
  @Patch(':systemId')
  async patchSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) editSystemPayload: EditSystemPayload): Promise<IdPayload> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('System not found.');
    }

    const { createdByUserId } = system;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot update entities unless you created them.');
    }

    return this.systemService.update(system, editSystemPayload);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Body(ValidationPipe) newSystemPayload: NewSystemPayload): Promise<void> {
    await this.systemService.create(newSystemPayload, sessionUserId);
  }
};
