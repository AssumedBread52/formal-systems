import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { PaginatedStatementsPayload } from '@/statement/payloads/paginated-statements.payload';
import { SearchStatementsPayload } from '@/statement/payloads/search-statements.payload';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { StatementWriteService } from '@/statement/services/statement-write.service';
import { ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class StatementResolver {
  public constructor(private readonly statementReadService: StatementReadService, private readonly statementWriteService: StatementWriteService) {
  }

  @Mutation((): typeof StatementEntity => {
    return StatementEntity;
  })
  @UseGuards(JwtGuard)
  public deleteStatement(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementWriteService.delete(sessionUserId, systemId, statementId);
  }

  @Query((): typeof StatementEntity => {
    return StatementEntity;
  })
  public statement(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }

  @Query((): typeof PaginatedStatementsPayload => {
    return PaginatedStatementsPayload;
  })
  public statements(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('filters', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchStatementsPayload: SearchStatementsPayload): Promise<PaginatedStatementsPayload> {
    return this.statementReadService.searchStatements(systemId, searchStatementsPayload);
  }
};
