import { StatementEntity } from '@/statement/entities/statement.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedStatementsPayload {
  @Field((): [typeof StatementEntity] => {
    return [StatementEntity];
  })
  public readonly results: StatementEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(statements: StatementEntity[], total: number) {
    this.results = statements;
    this.total = total;
  }
};
