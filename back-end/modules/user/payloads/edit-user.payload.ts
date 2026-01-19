import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword } from 'class-validator';

@InputType()
export class EditUserPayload {
  @Field()
  @IsNotEmpty()
  public readonly newFirstName: string = '';
  @Field()
  @IsNotEmpty()
  public readonly newLastName: string = '';
  @Field()
  @IsEmail()
  public readonly newEmail: string = '';
  @Field({
    nullable: true
  })
  @IsOptional()
  @IsStrongPassword()
  public readonly newPassword?: string;
};
