import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { SystemService } from '@/system/system.service';
import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
  @Delete(':symbolId')
  async deleteSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('symbolId') symbolId: ObjectId): Promise<IdPayload> {
    const symbol = await this.symbolService.readById(systemId, symbolId);

    if (!symbol) {
      return new IdPayload(symbolId);
    }

    const { createdByUserId } = symbol;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot delete a symbol unless you created it.');
    }

    await this.symbolService.delete(symbol);

    return new IdPayload(symbolId);
  }

  @Get()
  getSymbols(@ObjectIdDecorator('systemId') systemId: ObjectId, @Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.symbolService.readSymbols(systemId, page, count, keywords);
  }

  @Get(':symbolId')
  async getById(@ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('symbolId') symbolId: ObjectId): Promise<SymbolPayload> {
    const symbol = await this.symbolService.readById(systemId, symbolId);

    if (!symbol) {
      throw new NotFoundException('Symbol not found.');
    }

    return new SymbolPayload(symbol);
  }

  @UseGuards(JwtGuard)
  @Patch(':symbolId')
  async patchSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('symbolId') symbolId: ObjectId, @Body() editSymbolPayload: EditSymbolPayload): Promise<IdPayload> {
    const symbol = await this.symbolService.readById(systemId, symbolId);

    if (!symbol) {
      throw new NotFoundException('Symbol not found.');
    }

    const { createdByUserId } = symbol;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot update a symbol unless you created it.');
    }

    await this.symbolService.update(symbol, editSymbolPayload);

    return new IdPayload(symbolId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body() newSymbolPayload: NewSymbolPayload): Promise<void> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Symbols cannot be added to formal systems that do not exist.');
    }

    const { _id, createdByUserId } = system;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('Symbols cannot be added to formal systems unless you created them.');
    }

    await this.symbolService.create(newSymbolPayload, _id, sessionUserId);
  }
};
