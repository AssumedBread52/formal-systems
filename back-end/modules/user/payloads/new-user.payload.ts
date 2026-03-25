import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsStrongPassword, MaxLength } from 'class-validator';

@InputType()
export class NewUserPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(32)
  public readonly handle: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsEmail()
  @MaxLength(254)
  public readonly email: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsStrongPassword()
  public readonly password: string = '';
};
