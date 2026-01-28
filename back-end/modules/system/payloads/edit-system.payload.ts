import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class EditSystemPayload {
  @Field()
  @IsNotEmpty()
  public readonly newTitle: string = '';
  @Field()
  @IsNotEmpty()
  public readonly newDescription: string = '';
};
