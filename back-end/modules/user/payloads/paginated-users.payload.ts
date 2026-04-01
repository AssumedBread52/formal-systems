import { UserEntity } from '@/user/entities/user.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedUsersPayload {
  @Field((): [typeof UserEntity] => {
    return [UserEntity];
  })
  public readonly results: UserEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(users: UserEntity[], total: number) {
    this.results = users;
    this.total = total;
  }
};
