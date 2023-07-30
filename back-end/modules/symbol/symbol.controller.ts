import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { SystemService } from '@/system/system.service';
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EditSymbolPayload } from './payloads/edit-symbol.payload';
import { NewSymbolPayload } from './payloads/new-symbol.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { SymbolPayload } from './payloads/symbol.payload';
import { SymbolService } from './symbol.service';

@Controller('system/:systemId/symbol')
export class SymbolController {
  constructor(private symbolService: SymbolService, private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('id') id: ObjectId): Promise<IdPayload> {
    const symbol = await this.symbolService.readById(id);

    if (!symbol) {
      return new IdPayload(new ObjectId(id));
    }

    const { createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('You cannot delete symbols unless you created them.');
    }

    return this.symbolService.delete(symbol);
  }

  @Get()
  getSymbols(@ObjectIdDecorator('systemId') systemId: ObjectId, @Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.symbolService.readSymbols(systemId, page, count, keywords);
  }

  @Get(':id')
  async getById(@ObjectIdDecorator('id') id: ObjectId): Promise<SymbolPayload> {
    const symbol = await this.symbolService.readById(id);

    if (!symbol) {
      throw new NotFoundException('Symbol not found.');
    }

    return new SymbolPayload(symbol);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async patchSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('id') id: ObjectId, @Body(ValidationPipe) editSymbolPayload: EditSymbolPayload): Promise<IdPayload> {
    const symbol = await this.symbolService.readById(id);

    if (!symbol) {
      throw new NotFoundException('Symbol not found.');
    }

    const { createdByUserId } = symbol;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot update this entity.');
    }

    return this.symbolService.update(symbol, editSymbolPayload);
  }

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async postSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newSymbolPayload: NewSymbolPayload): Promise<void> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Symbols cannot be added to formal systems that do not exist.');
    }

    const { _id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('Symbols cannot be added to formal systems unless you created them.');
    }

    await this.symbolService.create(newSymbolPayload, sessionUserId, _id);
  }
};
