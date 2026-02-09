import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolWriteService } from '@/symbol/services/symbol-write.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/symbol')
export class SymbolController {
  public constructor(private readonly symbolReadService: SymbolReadService, private readonly symbolWriteService: SymbolWriteService) {
  }

  @Delete(':symbolId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public deleteSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolEntity> {
    return this.symbolWriteService.delete(sessionUserId, systemId, symbolId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getSymbols(@Param('systemId') systemId: string, @Query(new ValidationPipe({ transform: true })) searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    return this.symbolReadService.searchSymbols(systemId, searchSymbolsPayload);
  }

  @Get(':symbolId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId') systemId: string, @Param('symbolId') symbolId: string): Promise<SymbolEntity> {
    return this.symbolReadService.selectById(systemId, symbolId);
  }

  @Patch(':symbolId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public patchSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Param('symbolId') symbolId: string, @Body(new ValidationPipe({ transform: true })) editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    return this.symbolWriteService.update(sessionUserId, systemId, symbolId, editSymbolPayload);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postSymbol(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body(new ValidationPipe({ transform: true })) newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    return this.symbolWriteService.create(sessionUserId, systemId, newSymbolPayload);
  }
};
