import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SymbolPayload } from './payloads/symbol.payload';
import { SymbolCreateService } from './services/symbol-create.service';
import { SymbolDeleteService } from './services/symbol-delete.service';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolUpdateService } from './services/symbol-update.service';
import { SymbolEntity } from './symbol.entity';

@Controller('system/:systemId/symbol')
export class SymbolController {
  constructor(private symbolCreateService: SymbolCreateService, private symbolDeleteService: SymbolDeleteService, private symbolReadService: SymbolReadService, private symbolUpdateService: SymbolUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':symbolId')
  async deleteSymbol(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const deletedSymbol = await this.symbolDeleteService.delete(sessionUserId, systemId, symbolId);

    return new SymbolPayload(deletedSymbol);
  }

  @Get()
  async getSymbols(@Param('systemId') systemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<SymbolEntity, SymbolPayload>> {
    const [results, total] = await this.symbolReadService.readSymbols(systemId, payload);

    return new PaginatedResultsPayload(SymbolPayload, results, total);
  }

  @Get(':symbolId')
  async getById(@Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const symbol = await this.symbolReadService.readById(systemId, symbolId);

    return new SymbolPayload(symbol);
  }

  @UseGuards(JwtGuard)
  @Patch(':symbolId')
  async patchSymbol(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body() payload: any): Promise<SymbolPayload> {
    const updatedSymbol = await this.symbolUpdateService.update(sessionUserId, systemId, symbolId, payload);

    return new SymbolPayload(updatedSymbol);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSymbol(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<SymbolPayload> {
    const createdSymbol = await this.symbolCreateService.create(sessionUserId, systemId, payload);

    return new SymbolPayload(createdSymbol);
  }
};
