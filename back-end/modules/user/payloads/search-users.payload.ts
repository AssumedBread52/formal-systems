import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

@InputType()
export class SearchUsersPayload {
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  public readonly page: number = 1;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  public readonly pageSize: number = 10;
  @Field((): typeof String => {
    return String;
  })
  @IsString()
  public readonly searchText: string = '';
};
