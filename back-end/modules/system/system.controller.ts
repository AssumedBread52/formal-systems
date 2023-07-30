import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
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
  @Delete(':id')
  async deleteSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('id') id: ObjectId): Promise<IdPayload> {
    const system = await this.systemService.readById(id);

    if (!system) {
      return new IdPayload(new ObjectId(id));
    }

    const { createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('You cannot delete entities unless you created them.');
    }

    return this.systemService.delete(system);
  }

  @Get()
  getSystems(@Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.systemService.readSystems(page, count, keywords);
  }

  @Get(':id')
  async getById(@ObjectIdDecorator('id') id: ObjectId): Promise<SystemPayload> {
    const system = await this.systemService.readById(id);

    if (!system) {
      throw new NotFoundException('System not found.');
    }

    return new SystemPayload(system);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async patchSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('id') id: ObjectId, @Body(ValidationPipe) editSystemPayload: EditSystemPayload): Promise<IdPayload> {
    const system = await this.systemService.readById(id);

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
  @HttpCode(HttpStatus.NO_CONTENT)
  async postSystem(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Body(ValidationPipe) newSystemPayload: NewSystemPayload): Promise<void> {
    await this.systemService.create(newSystemPayload, sessionUserId);
  }
};
