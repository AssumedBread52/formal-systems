import { SessionUserId } from '@/auth/decorators/session-user-id';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Body, Controller, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
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
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  postSystem(@SessionUserId() sessionUserId: ObjectId, @Body(ValidationPipe) newSystemPayload: NewSystemPayload): void {
    this.systemService.create(newSystemPayload, sessionUserId);
  }
};
