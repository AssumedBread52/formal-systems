import { IsExpressionDecorator } from '@/common/decorators/is-expression.decorator';
import { BadRequestException } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, arrayMaxSize, arrayMinSize, arrayNotEmpty, isArray, isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class NewStatementPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @Transform((params: TransformFnParams): [ObjectId, ObjectId][] => {
    if (!isArray(params.value)) {
      throw new BadRequestException([
        'variableTypeHypotheses must be an array',
        'each value in variableTypeHypotheses must contain exactly 2 elements',
        'each value in each value in variableTypeHypotheses must be a mongodb id'
      ]);
    }

    params.value.forEach((item: any): void => {
      if (!arrayMaxSize(item, 2) || !arrayMinSize(item, 2)) {
        throw new BadRequestException([
          'each value in variableTypeHypotheses must contain exactly 2 elements',
          'each value in each value in variableTypeHypotheses must be a mongodb id'
        ]);
      }
    });

    params.value.forEach((item: [any, any]): void => {
      item.forEach((id: any): void => {
        if (!isMongoId(id)) {
          throw new BadRequestException([
            'each value in each value in variableTypeHypotheses must be a mongodb id'
          ]);
        }
      });
    });

    params.value.forEach((item: [any, any]): void => {
      if (item[0] === item[1]) {
        throw new BadRequestException([
          'each value in variableTypeHypotheses must contain 2 unique elements'
        ]);
      }
    });

    return params.value.map((item: [string, string]): [ObjectId, ObjectId] => {
      return [
        new ObjectId(item[0]),
        new ObjectId(item[1])
      ];
    });
  })
  distinctVariableRestrictions: [ObjectId, ObjectId][] = [];
  @Transform((params: TransformFnParams): [ObjectId, ObjectId][] => {
    if (!isArray(params.value)) {
      throw new BadRequestException([
        'variableTypeHypotheses must be an array',
        'each value in variableTypeHypotheses must contain exactly 2 elements',
        'each value in each value in variableTypeHypotheses must be a mongodb id'
      ]);
    }

    params.value.forEach((item: any): void => {
      if (!arrayMaxSize(item, 2) || !arrayMinSize(item, 2)) {
        throw new BadRequestException([
          'each value in variableTypeHypotheses must contain exactly 2 elements',
          'each value in each value in variableTypeHypotheses must be a mongodb id'
        ]);
      }
    });

    params.value.forEach((item: [any, any]): void => {
      item.forEach((id: any): void => {
        if (!isMongoId(id)) {
          throw new BadRequestException([
            'each value in each value in variableTypeHypotheses must be a mongodb id'
          ]);
        }
      });
    });

    return params.value.map((item: [string, string]): [ObjectId, ObjectId] => {
      return [
        new ObjectId(item[0]),
        new ObjectId(item[1])
      ];
    });
  })
  variableTypeHypotheses: [ObjectId, ObjectId][] = [];
  @IsArray()
  @ArrayNotEmpty({
    each: true
  })
  @IsExpressionDecorator({
    each: true
  })
  @Transform((params: TransformFnParams): ObjectId[][] => {
    if (!isArray(params.value)) {
      return params.value;
    }

    for (let item of params.value) {
      if (!arrayNotEmpty(item)) {
        return params.value;
      }

      for (let id of item) {
        if (!isMongoId(id)) {
          return params.value;
        }
      }
    }

    return params.value.map((expression: string[]): ObjectId[] => {
      return expression.map((id: string): ObjectId => {
        return new ObjectId(id);
      });
    });
  })
  logicalHypotheses: ObjectId[][] = [];
  @ArrayNotEmpty()
  @IsExpressionDecorator()
  @Transform((params: TransformFnParams): ObjectId[] => {
    if (!arrayNotEmpty(params.value)) {
      return params.value;
    }

    for (let item of params.value) {
      if (!isMongoId(item)) {
        return params.value;
      }
    }

    return params.value.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    });
  })
  assertion: ObjectId[] = [];
};
