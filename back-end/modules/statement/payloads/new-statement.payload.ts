import { IsDistinctPairDecorator } from '@/common/decorators/is-distinct-pair.decorator';
import { IsExpressionDecorator } from '@/common/decorators/is-expression.decorator';
import { ArrayMinSize, ArrayUnique, IsArray, IsNotEmpty, isArray } from 'class-validator';

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
  distinctVariableRestrictions: [string, string][] = [];
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
  variableTypeHypotheses: [string, string][] = [];
  @ArrayMinSize(1, {
    each: true
  })
  @ArrayUnique((element: any): string => {
    if (!isArray(element)) {
      return '';
    }

    return element.map((item: any): string => {
      return `${item}`;
    }).join(',');
  })
  @IsArray()
  @IsExpressionDecorator({
    each: true
  })
  logicalHypotheses: [string, ...string[]][] = [];
  @ArrayMinSize(1)
  @IsExpressionDecorator()
  assertion: [string, ...string[]] = [''];
};
