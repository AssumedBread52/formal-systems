import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

@InputType()
export class NewUserPayload {
  @Field()
  @IsNotEmpty()
  public readonly firstName: string = '';
  @Field()
  @IsNotEmpty()
  public readonly lastName: string = '';
  @Field()
  @IsEmail()
  public readonly email: string = '';
  @Field()
  @IsStrongPassword()
  public readonly password: string = '';
};
