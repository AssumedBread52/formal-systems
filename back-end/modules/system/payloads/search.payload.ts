import { BadRequestException } from '@nestjs/common';
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
  @Transform((params: TransformFnParams): ObjectId[] => {
    if (!isArray(params.value)) {
      throw new BadRequestException([
        'each value in userIds must be a mongodb id',
        'userIds must be an array'
      ]);
    }

    params.value.forEach((item: any): void => {
      if (!isMongoId(item)) {
        throw new BadRequestException([
          'each value in userIds must be a mongodb id'
        ]);
      }
    });

    return params.value.map((userId: string): ObjectId => {
      return new ObjectId(userId);
    });
  })
  userIds: ObjectId[] = [];
};
