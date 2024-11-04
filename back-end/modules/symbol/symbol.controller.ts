import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SymbolType } from './enums/symbol-type.enum';
import { SymbolPayload } from './payloads/symbol.payload';
import { SymbolCreateService } from './services/symbol-create.service';
import { SymbolDeleteService } from './services/symbol-delete.service';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolUpdateService } from './services/symbol-update.service';
import { SymbolEntity } from './symbol.entity';
import { SymbolService } from './symbol.service';

@Controller('system/:systemId/symbol')
export class SymbolController {
  constructor(private symbolCreateService: SymbolCreateService, private symbolDeleteService: SymbolDeleteService, private symbolReadService: SymbolReadService, private symbolUpdateService: SymbolUpdateService, private symbolService: SymbolService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':symbolId')
  async deleteSymbol(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const symbol = await this.symbolDeleteService.delete(sessionUserId, systemId, symbolId);

    return new SymbolPayload(symbol);
  }

  @Get()
  async getSymbols(@Param('systemId') systemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<SymbolEntity, SymbolPayload>> {
    const [results, total] = await this.symbolReadService.readSymbols(systemId, payload);

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
  async getById(@Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const symbol = await this.symbolReadService.readById(systemId, symbolId);

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
