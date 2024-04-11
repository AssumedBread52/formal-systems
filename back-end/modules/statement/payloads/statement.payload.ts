import { IsDistinctPairDecorator } from '@/common/decorators/is-distinct-pair.decorator';
import { IsExpressionDecorator } from '@/common/decorators/is-expression.decorator';
import { StatementEntity } from '@/statement/statement.entity';
import { ArrayMinSize, ArrayUnique, IsArray, IsMongoId, IsNotEmpty, isArray } from 'class-validator';
import { ObjectId } from 'mongodb';

export class StatementPayload {
  @IsMongoId()
  id: string;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
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
  distinctVariableRestrictions: [string, string][];
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
  variableTypeHypotheses: [string, string][];
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
  logicalHypotheses: string[][];
  @ArrayMinSize(1)
  @IsExpressionDecorator()
  assertion: string[];
  @IsMongoId()
  systemId: string;
  @IsMongoId()
  createdByUserId: string;

  constructor(statement: StatementEntity) {
    const { _id, title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, systemId, createdByUserId } = statement;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.distinctVariableRestrictions = distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
      return [
        distinctVariableRestriction[0].toString(),
        distinctVariableRestriction[1].toString()
      ];
    });
    this.variableTypeHypotheses = variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
      return [
        variableTypeHypothesis[0].toString(),
        variableTypeHypothesis[1].toString()
      ];
    });
    this.logicalHypotheses = logicalHypotheses.map((logicalHypothesis: ObjectId[]): string[] => {
      return logicalHypothesis.map((symbolId: ObjectId): string => {
        return symbolId.toString();
      });
    });
    this.assertion = assertion.map((symbolId: ObjectId): string => {
      return symbolId.toString();
    });
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
