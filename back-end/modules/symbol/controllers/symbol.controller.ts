import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SymbolService } from '@/symbol/services/symbol.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

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
  public patchSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body(new ValidationPipe({ transform: true })) editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    return this.symbolService.update(sessionUserId, systemId, symbolId, editSymbolPayload);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body(new ValidationPipe({ transform: true })) newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    return this.symbolService.create(sessionUserId, systemId, newSymbolPayload);
  }
};
