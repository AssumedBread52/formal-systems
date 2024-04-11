import { IsDistinctPairDecorator } from '@/common/decorators/is-distinct-pair.decorator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ArrayUnique, IsArray, IsNotEmpty, isArray, isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class EditStatementPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  @ArrayUnique((element: any): string => {
    if (!isArray(element) || 2 !== element.length) {
      return '';
    }

    const first = `${element[0]}`;
    const second = `${element[1]}`;

    if (first.localeCompare(second) < 0) {
      return `${first}${second}`;
    } else {
      return `${second}${first}`;
    }
  })
  @IsArray()
  @IsDistinctPairDecorator({
    each: true
  })
  @Transform((params: TransformFnParams): any => {
    if (!isArray(params.value)) {
      return params.value;
    }

    for (let element of params.value) {
      if (!isArray(element)) {
        return params.value;
      }

      for (let item of element) {
        if (!isMongoId(item)) {
          return params.value;
        }
      }
    }

    return params.value.map((item: string[]): ObjectId[] => {
      return item.map((id: string): ObjectId => {
        return new ObjectId(id);
      });
    });
  })
  newDistinctVariableRestrictions: [ObjectId, ObjectId][] = [];
  @ArrayUnique((element: any): string => {
    if (!isArray(element) || 2 !== element.length) {
      return '';
    }

    return `${element[1]}`;
  })
  @IsArray()
  @IsDistinctPairDecorator({
    each: true
  })
  @Transform((params: TransformFnParams): any => {
    if (!isArray(params.value)) {
      return params.value;
    }

    for (let element of params.value) {
      if (!isArray(element)) {
        return params.value;
      }

      for (let item of element) {
        if (!isMongoId(item)) {
          return params.value;
        }
      }
    }

    return params.value.map((item: string[]): ObjectId[] => {
      return item.map((id: string): ObjectId => {
        return new ObjectId(id);
      });
    });
  })
  newVariableTypeHypotheses: [ObjectId, ObjectId][] = [];
};
