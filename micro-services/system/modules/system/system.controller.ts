import { Body, Controller, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { NewSystemPayload, PaginatedResults } from './data-transfer-objects';
import { SessionUserId } from './decorators';
import { JwtGuard } from './guards';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @Get()
  async readFormalSystems(@Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResults> {
    const total = await this.systemService.readTotalCountByKeywords(keywords);
    const systems = await this.systemService.readPaginatedByKeywords(page, count, keywords);

    return new PaginatedResults(total, systems);
  }

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  createSystem(@SessionUserId() sessionUserId: string, @Body(new ValidationPipe()) newSystemPayload: NewSystemPayload): void {
    const { title, description } = newSystemPayload;

    this.systemService.create({
      title,
      urlPath: encodeURIComponent(title),
      description,
      createdByUserId: sessionUserId
    });
  }
};
