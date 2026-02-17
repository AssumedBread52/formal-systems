import { ConstantVariablePairExpressionPayload } from '@/statement/payloads/constant-variable-pair-expression.payload';
import { DistinctVariablePairPayload } from '@/statement/payloads/distinct-variable-pair.payload';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, IsMongoId, IsNotEmpty, Min, ValidateNested } from 'class-validator';

@ObjectType()
export class StatementEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public id: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public title: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public description: string = '';
  @ArrayUnique((distinctVariableRestriction: DistinctVariablePairPayload): string => {
    return [...distinctVariableRestriction.variableSymbolIds].sort().join('::');
  })
  @Field((): [typeof DistinctVariablePairPayload] => {
    return [DistinctVariablePairPayload];
  })
  @IsArray()
  @Type((): typeof DistinctVariablePairPayload => {
    return DistinctVariablePairPayload;
  })
  @ValidateNested({
    each: true
  })
  public distinctVariableRestrictions: DistinctVariablePairPayload[] = [];
  @ArrayUnique((variableTypeHypothesis: ConstantVariablePairExpressionPayload): string => {
    return variableTypeHypothesis.suffixedVariableSymbolId;
  })
  @Field((): [typeof ConstantVariablePairExpressionPayload] => {
    return [ConstantVariablePairExpressionPayload];
  })
  @IsArray()
  @Type((): typeof ConstantVariablePairExpressionPayload => {
    return ConstantVariablePairExpressionPayload;
  })
  @ValidateNested({
    each: true
  })
  public variableTypeHypotheses: ConstantVariablePairExpressionPayload[] = [];
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public proofCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public proofAppearanceCount: number = 0;
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public systemId: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public createdByUserId: string = '';
};
