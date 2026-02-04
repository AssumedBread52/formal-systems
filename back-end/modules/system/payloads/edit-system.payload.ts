import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class EditSystemPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly newTitle: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly newDescription: string = '';
};
