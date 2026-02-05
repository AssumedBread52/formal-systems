import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { SymbolService } from '@/symbol/services/symbol.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class SymbolResolver {
  public constructor(private readonly symbolService: SymbolService) {
  }

  @Mutation((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @UseGuards(JwtGuard)
  public createSymbol(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('symbolPayload', new ValidationPipe({ transform: true })) newSymbolPayload: NewSymbolPayload) {
    return this.symbolService.create(sessionUserId, systemId, newSymbolPayload);
  }

  @Mutation((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @UseGuards(JwtGuard)
  public deleteSymbol(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('symbolId') symbolId: string): Promise<SymbolEntity> {
    return this.symbolService.delete(sessionUserId, systemId, symbolId);
  }

  @Query((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  public symbol(@Args('systemId') systemId: string, @Args('symbolId') symbolId: string): Promise<SymbolEntity> {
    return this.symbolService.selectById(systemId, symbolId);
  }

  @Query((): typeof PaginatedSymbolsPayload => {
    return PaginatedSymbolsPayload;
  })
  public symbols(@Args('systemId') systemId: string, @Args('filters', new ValidationPipe({ transform: true })) searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    return this.symbolService.searchSymbols(systemId, searchSymbolsPayload);
  }

  @Mutation((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @UseGuards(JwtGuard)
  public updateSymbol(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('symbolId') symbolId: string, @Args('symbolPayload', new ValidationPipe({ transform: true })) editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    return this.symbolService.update(sessionUserId, systemId, symbolId, editSymbolPayload);
  }
};
