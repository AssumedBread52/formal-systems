import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SymbolType } from './enums/symbol-type.enum';
import { SymbolNotFoundException } from './exceptions/symbol-not-found.exception';
import { SearchPayload } from './payloads/search.payload';
import { SymbolPayload } from './payloads/symbol.payload';
import { SymbolCreateService } from './services/symbol-create.service';
import { SymbolDeleteService } from './services/symbol-delete.service';
import { SymbolUpdateService } from './services/symbol-update.service';
import { SymbolEntity } from './symbol.entity';
import { SymbolService } from './symbol.service';

@Controller('system/:systemId/symbol')
export class SymbolController {
  constructor(private symbolCreateService: SymbolCreateService, private symbolDeleteService: SymbolDeleteService, private symbolUpdateService: SymbolUpdateService, private symbolService: SymbolService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':symbolId')
  async deleteSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const symbol = await this.symbolDeleteService.delete(sessionUserId, systemId, symbolId);

    return new SymbolPayload(symbol);
  }

  @Get()
  async getSymbols(@ObjectIdDecorator('systemId') systemId: ObjectId, @Query(new ValidationPipe({ transform: true })) searchPayload: SearchPayload): Promise<PaginatedResultsPayload<SymbolEntity, SymbolPayload>> {
    const { page, count, keywords, types } = searchPayload;

    const [results, total] = await this.symbolService.readSymbols(page, count, keywords, types, systemId);

    return new PaginatedResultsPayload(SymbolPayload, results, total);
  }

  @UseGuards(JwtGuard)
  @Get('constant')
  async getConstantSymbols(@ObjectIdDecorator('systemId') systemId: ObjectId): Promise<SymbolPayload[]> {
    const symbols = await this.symbolService.readByType(systemId, SymbolType.Constant);

    return symbols.map((symbol: SymbolEntity): SymbolPayload => {
      return new SymbolPayload(symbol);
    });
  }

  @UseGuards(JwtGuard)
  @Get('variable')
  async getVariableSymbols(@ObjectIdDecorator('systemId') systemId: ObjectId): Promise<SymbolPayload[]> {
    const symbols = await this.symbolService.readByType(systemId, SymbolType.Variable);

    return symbols.map((symbol: SymbolEntity): SymbolPayload => {
      return new SymbolPayload(symbol);
    });
  }

  @Get(':symbolId')
  async getById(@ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('symbolId') symbolId: ObjectId): Promise<SymbolPayload> {
    const symbol = await this.symbolService.readById(systemId, symbolId);

    if (!symbol) {
      throw new SymbolNotFoundException();
    }

    return new SymbolPayload(symbol);
  }

  @UseGuards(JwtGuard)
  @Patch(':symbolId')
  async patchSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body() payload: any): Promise<SymbolPayload> {
    const updatedSymbol = await this.symbolUpdateService.update(sessionUserId, systemId, symbolId, payload);

    return new SymbolPayload(updatedSymbol);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<SymbolPayload> {
    const createdSymbol = await this.symbolCreateService.create(sessionUserId, systemId, payload);

    return new SymbolPayload(createdSymbol);
  }
};
