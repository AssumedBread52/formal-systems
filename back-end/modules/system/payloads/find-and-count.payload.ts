import { ArrayUnique, IsArray, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class FindAndCountPayload {
  @IsInt()
  @Min(0)
  public readonly take: number = 0;
  @IsInt()
  @Min(0)
  public readonly skip: number = 0;
  @ArrayUnique()
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  public readonly keywords: string[] = [];
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly userIds: string[] = [];
};
