import { IdPayload } from '@/auth/data-transfer-objects/id.payload';
import { SessionUserId } from '@/auth/decorators/session-user-id';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EditSystemPayload } from './data-transfer-objects/edit-system.payload';
import { NewSystemPayload } from './data-transfer-objects/new-system.payload';
import { PaginatedResultsPayload } from './data-transfer-objects/paginated-results.payload';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @Get()
  getSystems(@Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.systemService.readSystems(page, count, keywords);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async patchSystem(@SessionUserId() sessionUserId: ObjectId, @Param('id') id: string, @Body(ValidationPipe) editSystemPayload: EditSystemPayload): Promise<IdPayload> {
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
  postSystem(@SessionUserId() sessionUserId: ObjectId, @Body(ValidationPipe) newSystemPayload: NewSystemPayload): void {
    this.systemService.create(newSystemPayload, sessionUserId);
  }
};
