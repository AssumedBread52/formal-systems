import { SystemEntity } from '@/system/entities/system.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedSystemsPayload {
  @Field((): [typeof SystemEntity] => {
    return [SystemEntity];
  })
  public readonly results: SystemEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(systems: SystemEntity[], total: number) {
    this.results = systems;
    this.total = total;
  }
};
