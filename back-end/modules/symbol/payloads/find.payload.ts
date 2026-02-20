import { ArrayUnique, IsArray, IsMongoId } from 'class-validator';

export class FindPayload {
  @IsMongoId()
  public readonly systemId: string = '';
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly symbolIds: string[] = [];
};
