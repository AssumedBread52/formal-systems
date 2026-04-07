import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

@Entity('symbols')
@ObjectType()
@Unique('symbols_system_id_name_unique', [
  'system',
  'name'
])
@Unique('symbols_id_system_id_unique', [
  'id',
  'system'
])
export class SymbolEntity {
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
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  public type: SymbolType = SymbolType.constant;
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public content: string = '';
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public distinctVariablePairAppearanceCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantVariablePairExpressionAppearanceCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantPrefixedExpressionAppearanceCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public standardExpressionAppearanceCount: number = 0;
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

  public isInUse(): boolean {
    return (0 < this.distinctVariablePairAppearanceCount) || (0 < this.constantVariablePairExpressionAppearanceCount) || (0 < this.constantPrefixedExpressionAppearanceCount) || (0 < this.standardExpressionAppearanceCount);
  }
};
