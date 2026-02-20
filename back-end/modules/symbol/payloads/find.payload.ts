import { ArrayUnique, IsArray, IsMongoId } from 'class-validator';

export class FindPayload {
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly ids: string[] = [];
  @IsMongoId()
  public readonly systemId: string = '';
};
