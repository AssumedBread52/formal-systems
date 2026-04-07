import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolWriteService } from '@/symbol/services/symbol-write.service';
import { ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class SymbolResolver {
  public constructor(private readonly symbolReadService: SymbolReadService, private readonly symbolWriteService: SymbolWriteService) {
  }

  @Mutation((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @UseGuards(JwtGuard)
  public createSymbol(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('symbolPayload', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    return this.symbolWriteService.create(sessionUserId, systemId, newSymbolPayload);
  }

  @Mutation((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @UseGuards(JwtGuard)
  public deleteSymbol(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('symbolId', new ParseUUIDPipe()) symbolId: string): Promise<SymbolEntity> {
    return this.symbolWriteService.delete(sessionUserId, systemId, symbolId);
  }

  @Query((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  public symbol(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('symbolId', new ParseUUIDPipe()) symbolId: string): Promise<SymbolEntity> {
    return this.symbolReadService.selectById(systemId, symbolId);
  }

  @Query((): typeof PaginatedSymbolsPayload => {
    return PaginatedSymbolsPayload;
  })
  public symbols(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('filters', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    return this.symbolReadService.searchSymbols(systemId, searchSymbolsPayload);
  }

  @Mutation((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @UseGuards(JwtGuard)
  public updateSymbol(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('symbolId', new ParseUUIDPipe()) symbolId: string, @Args('symbolPayload', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    return this.symbolWriteService.update(sessionUserId, systemId, symbolId, editSymbolPayload);
  }
};
