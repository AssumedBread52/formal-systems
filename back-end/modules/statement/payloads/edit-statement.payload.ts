import { IsDistinctPairDecorator } from '@/common/decorators/is-distinct-pair.decorator';
import { IsExpressionDecorator } from '@/common/decorators/is-expression.decorator';
import { ArrayMinSize, ArrayUnique, IsArray, isArray, IsNotEmpty } from 'class-validator';

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
  newDistinctVariableRestrictions: [string, string][] = [];
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
  newVariableTypeHypotheses: [string, string][] = [];
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
  newLogicalHypotheses: [string, ...string[]][] = [];
  @ArrayMinSize(1)
  @IsExpressionDecorator()
  newAssertion: [string, ...string[]] = [''];
};
