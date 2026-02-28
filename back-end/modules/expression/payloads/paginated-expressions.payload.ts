import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedExpressionsPayload {
  @Field((): [typeof ExpressionEntity] => {
    return [ExpressionEntity];
  })
  public readonly results: ExpressionEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(expressions: ExpressionEntity[], total: number) {
    this.results = expressions;
    this.total = total;
  }
};
