import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { IsEmail, IsInt, IsMongoId, IsNotEmpty, Matches, Min } from 'class-validator';

@ObjectType()
export class UserEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public id: string = '';
  @Field()
  @IsNotEmpty()
  public firstName: string = '';
  @Field()
  @IsNotEmpty()
  public lastName: string = '';
  @Field()
  @IsEmail()
  public email: string = '';
  @Exclude()
  @Matches(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
  public hashedPassword: string = '';
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public systemCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantSymbolCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public variableSymbolCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public axiomCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public theoremCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public deductionCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public proofCount: number = 0;
};
