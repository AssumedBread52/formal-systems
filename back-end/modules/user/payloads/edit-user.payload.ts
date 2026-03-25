import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword, MaxLength } from 'class-validator';

@InputType()
export class EditUserPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(32)
  public readonly newHandle: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsEmail()
  @MaxLength(254)
  public readonly newEmail: string = '';
  @Field((): typeof String => {
    return String;
  }, {
    nullable: true
  })
  @IsOptional()
  @IsStrongPassword()
  public readonly newPassword?: string;
};
