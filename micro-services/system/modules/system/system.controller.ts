import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ClientSystem, IdPayload, NewSystemPayload, PaginatedResults, UpdateSystemPayload } from './data-transfer-objects';
import { SessionUserId } from './decorators';
import { JwtGuard } from './guards';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteById(@SessionUserId() sessionUserId: string, @Param('id') id: string): Promise<IdPayload> {
    const target = await this.systemService.readById(id);

    if (!target) {
      return {
        id
      };
    }

    const { createdByUserId } = target;

    if (createdByUserId !== sessionUserId) {
      throw new ForbiddenException();
    }

    await this.systemService.delete(id);

    return {
      id
    };
  }

  @Get(':urlPath')
  async getSystemByUrlPath(@Param('urlPath') urlPath: string): Promise<ClientSystem> {
    const system = await this.systemService.readByUrlPath(urlPath);

    if (!system) {
      throw new NotFoundException();
    }

    return new ClientSystem(system);
  }

  @Get()
  async getSystems(@Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResults> {
    const total = await this.systemService.readTotalCountByKeywords(keywords);
    const systems = await this.systemService.readPaginatedByKeywords(page, count, keywords);

    return new PaginatedResults(total, systems);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async patchSystem(@SessionUserId() sessionUserId: string, @Param('id') id: string, @Body(new ValidationPipe()) updateSystemPayload: UpdateSystemPayload): Promise<IdPayload> {
    const system = await this.systemService.readById(id);

    if (!system) {
      throw new NotFoundException();
    }

    const { createdByUserId } = system;

    if (createdByUserId !== sessionUserId) {
      throw new ForbiddenException();
    }

    await this.systemService.update(system, updateSystemPayload);

    return {
      id
    };
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
