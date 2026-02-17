import { ArrayUnique, IsArray, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class FindAndCountPayload {
  @IsInt()
  @Min(0)
  public readonly skip: number = 0;
  @IsInt()
  @Min(0)
  public readonly take: number = 0;
  @IsMongoId()
  public readonly systemId: string = '';
  @ArrayUnique()
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  public readonly keywords: string[] = [];
};
