import { IsDistinctPairDecorator } from '@/common/decorators/is-distinct-pair.decorator';
import { IsExpressionDecorator } from '@/common/decorators/is-expression.decorator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsNotEmpty, isArray, isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class NewStatementPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
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
  distinctVariableRestrictions: [ObjectId, ObjectId][] = [];
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
  variableTypeHypotheses: [ObjectId, ObjectId][] = [];
  @ArrayMinSize(1, {
    each: true
  })
  @ArrayUnique((element: any): string => {
    if (!isArray(element)) {
      return '';
    }

    return element.map((id: any): string => {
      return `${id}`;
    }).join(',');
  })
  @IsArray()
  @IsExpressionDecorator({
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
  logicalHypotheses: ObjectId[][] = [];
  @ArrayMinSize(1)
  @IsExpressionDecorator()
  @Transform((params: TransformFnParams): any => {
    if (!isArray(params.value)) {
      return params.value;
    }

    for (let element of params.value) {
      if (!isMongoId(element)) {
        return params.value;
      }
    }

    return params.value.map((element: string): ObjectId => {
      return new ObjectId(element);
    });
  })
  assertion: ObjectId[] = [];
};
