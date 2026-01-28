import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class NewSystemPayload {
  @Field()
  @IsNotEmpty()
  public readonly title: string = '';
  @Field()
  @IsNotEmpty()
  public readonly description: string = '';
};
