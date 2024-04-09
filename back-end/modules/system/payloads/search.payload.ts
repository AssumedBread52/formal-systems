import { IsMongoIdDecorator } from '@/common/decorators/is-mongo-id.decorator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, Min, isArray, isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SearchPayload {
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  page: number = 1;
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  count: number = 10;
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  keywords: string[] = [];
  @IsArray()
  @IsMongoIdDecorator({
    each: true
  })
  @Transform((params: TransformFnParams): ObjectId[] => {
    if (!isArray(params.value)) {
      return params.value;
    }

    for (let item of params.value) {
      if (!isMongoId(item)) {
        return params.value;
      }
    }

    return params.value.map((userId: string): ObjectId => {
      return new ObjectId(userId);
    });
  })
  userIds: ObjectId[] = [];
};
