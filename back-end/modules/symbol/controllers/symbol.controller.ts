import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolPayload } from '@/symbol/payloads/symbol.payload';
import { SymbolCreateService } from '@/symbol/services/symbol-create.service';
import { SymbolDeleteService } from '@/symbol/services/symbol-delete.service';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolUpdateService } from '@/symbol/services/symbol-update.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Controller('system/:systemId/symbol')
export class SymbolController {
  constructor(private symbolCreateService: SymbolCreateService, private symbolDeleteService: SymbolDeleteService, private symbolReadService: SymbolReadService, private symbolUpdateService: SymbolUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':symbolId')
  async deleteSymbol(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const deletedSymbol = await this.symbolDeleteService.delete(sessionUserId, systemId, symbolId);

    return new SymbolPayload(deletedSymbol);
  }

  @Get()
  async getSymbols(@Param('systemId') systemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<SymbolEntity>> {
    const [results, total] = await this.symbolReadService.readSymbols(systemId, payload);

    return new PaginatedResultsPayload(results, total);
  }

  @Get(':symbolId')
  async getById(@Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const symbol = await this.symbolReadService.readById(systemId, symbolId);

    return new SymbolPayload(symbol);
  }

  @UseGuards(JwtGuard)
  @Patch(':symbolId')
  async patchSymbol(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body() payload: any): Promise<SymbolPayload> {
    const updatedSymbol = await this.symbolUpdateService.update(sessionUserId, systemId, symbolId, payload);

    return new SymbolPayload(updatedSymbol);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postSymbol(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<SymbolPayload> {
    const createdSymbol = await this.symbolCreateService.create(sessionUserId, systemId, payload);

    return new SymbolPayload(createdSymbol);
  }
};
