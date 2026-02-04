import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class NewSystemPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly title: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly description: string = '';
};
