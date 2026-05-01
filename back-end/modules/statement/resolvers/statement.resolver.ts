import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class StatementResolver {
  public constructor(private readonly statementReadService: StatementReadService) {
  }

  @Query((): typeof StatementEntity => {
    return StatementEntity;
  })
  public statement(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }
};
