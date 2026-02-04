import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword } from 'class-validator';

@InputType()
export class EditUserPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly newFirstName: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly newLastName: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsEmail()
  public readonly newEmail: string = '';
  @Field({
    nullable: true
  })
  @IsOptional()
  @IsStrongPassword()
  public readonly newPassword?: string;
};
