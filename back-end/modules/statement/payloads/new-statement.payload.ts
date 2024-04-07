import { BadRequestException } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, arrayMaxSize, arrayMinSize, arrayNotEmpty, isArray, isMongoId } from 'class-validator';
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
  @Transform((params: TransformFnParams): ObjectId[][] => {
    if (!isArray(params.value)) {
      throw new BadRequestException([
        'each value in each value in logicalHypotheses must be a mongodb id',
        'each value in logicalHypotheses should not be empty',
        'logicalHypotheses must be an array'
      ]);
    }

    params.value.forEach((item: any): void => {
      if (!arrayNotEmpty(item)) {
        throw new BadRequestException([
          'each value in each value in logicalHypotheses must be a mongodb id',
          'each value in logicalHypotheses should not be empty'
        ]);
      }
    });

    params.value.forEach((item: any[]): void => {
      item.forEach((id: any): void => {
        if (!isMongoId(id)) {
          throw new BadRequestException([
            'each value in each value in logicalHypotheses must be a mongodb id'
          ]);
        }
      });
    });

    return params.value.map((expression: string[]): ObjectId[] => {
      return expression.map((id: string): ObjectId => {
        return new ObjectId(id);
      });
    });
  })
  logicalHypotheses: ObjectId[][] = [];
  @Transform((params: TransformFnParams): ObjectId[] => {
    if (!arrayNotEmpty(params.value)) {
      throw new BadRequestException([
        'each value in assertion must be a mongodb id',
        'assertion should not be empty'
      ]);
    }

    params.value.forEach((item: any): void => {
      if (!isMongoId(item)) {
        throw new BadRequestException([
          'each value in assertion must be a mongodb id'
        ]);
      }
    });

    return params.value.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    });
  })
  assertion: ObjectId[] = [];
};
