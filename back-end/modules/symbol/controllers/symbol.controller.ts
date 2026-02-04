import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolService } from '@/symbol/services/symbol.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';

@Controller('system/:systemId/symbol')
export class SymbolController {
  public constructor(private readonly symbolService: SymbolService) {
  }

  @Delete(':symbolId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public deleteSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolEntity> {
    return this.symbolService.delete(sessionUserId, systemId, symbolId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public async getSymbols(@Param('systemId') systemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<SymbolEntity>> {
    const [results, total] = await this.symbolService.readSymbols(systemId, payload);

    return new PaginatedResultsPayload(results, total);
  }

  @Get(':symbolId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolEntity> {
    return this.symbolService.selectById(systemId, symbolId);
  }

  @Patch(':symbolId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public patchSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body() payload: any): Promise<SymbolEntity> {
    return this.symbolService.update(sessionUserId, systemId, symbolId, payload);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body() payload: any): Promise<SymbolEntity> {
    return this.symbolService.create(sessionUserId, systemId, payload);
  }
};
