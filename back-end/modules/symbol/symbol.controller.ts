import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemService } from '@/system/system.service';
import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EditSymbolPayload } from './payloads/edit-symbol.payload';
import { NewSymbolPayload } from './payloads/new-symbol.payload';
import { SearchPayload } from './payloads/search.payload';
import { SymbolPayload } from './payloads/symbol.payload';
import { SymbolEntity } from './symbol.entity';
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

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('You cannot delete a symbol unless you created it.');
    }

    await this.symbolService.delete(symbol);

    return new IdPayload(symbolId);
  }

  @Get()
  async getSymbols(@ObjectIdDecorator('systemId') systemId: ObjectId, @Query(new ValidationPipe({ transform: true })) queryParameters: SearchPayload): Promise<PaginatedResultsPayload<SymbolEntity, SymbolPayload>> {
    const { page, count, keywords, types } = queryParameters;

    const [results, total] = await this.symbolService.readSymbols(page, count, keywords, types, systemId);

    return new PaginatedResultsPayload(SymbolPayload, results, total);
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
  async patchSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('symbolId') symbolId: ObjectId, @Body(ValidationPipe) editSymbolPayload: EditSymbolPayload): Promise<IdPayload> {
    const symbol = await this.symbolService.readById(systemId, symbolId);

    if (!symbol) {
      throw new NotFoundException('Symbol not found.');
    }

    const { createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('You cannot update a symbol unless you created it.');
    }

    await this.symbolService.update(symbol, editSymbolPayload);

    return new IdPayload(symbolId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newSymbolPayload: NewSymbolPayload): Promise<void> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Symbols cannot be added to formal systems that do not exist.');
    }

    const { _id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('Symbols cannot be added to formal systems unless you created them.');
    }

    await this.symbolService.create(newSymbolPayload, _id, sessionUserId);
  }
};
