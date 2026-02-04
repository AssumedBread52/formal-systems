import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolPayload } from '@/symbol/payloads/symbol.payload';
import { SymbolService } from '@/symbol/services/symbol.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Controller('system/:systemId/symbol')
export class SymbolController {
  constructor(private symbolService: SymbolService) {
  }

  @Delete(':symbolId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteSymbol(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const deletedSymbol = await this.symbolService.delete(sessionUserId, systemId, symbolId);

    return new SymbolPayload(deletedSymbol);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getSymbols(@Param('systemId') systemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<SymbolEntity>> {
    const [results, total] = await this.symbolService.readSymbols(systemId, payload);

    return new PaginatedResultsPayload(results, total);
  }

  @Get(':symbolId')
  @UseInterceptors(ClassSerializerInterceptor)
  async getById(@Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolPayload> {
    const symbol = await this.symbolService.readById(systemId, symbolId);

    return new SymbolPayload(symbol);
  }

  @Patch(':symbolId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async patchSymbol(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body() payload: any): Promise<SymbolPayload> {
    const updatedSymbol = await this.symbolService.update(sessionUserId, systemId, symbolId, payload);

    return new SymbolPayload(updatedSymbol);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async postSymbol(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<SymbolPayload> {
    const createdSymbol = await this.symbolService.create(sessionUserId, systemId, payload);

    return new SymbolPayload(createdSymbol);
  }
};
