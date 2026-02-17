import { IsArray, IsMongoId } from 'class-validator';

export class ExpressionPayload {
  @IsArray()
  @IsMongoId({
    each: true
  })
  public symbolIds: string[] = [];
};
