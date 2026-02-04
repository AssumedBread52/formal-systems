import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

@InputType()
export class NewUserPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly firstName: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly lastName: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsEmail()
  public readonly email: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsStrongPassword()
  public readonly password: string = '';
};
