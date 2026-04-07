import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsUUID, MaxLength, Min } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  public id!: string;
  @Column({
    name: 'system_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public systemId: string = '';
  @Column({
    length: 200,
    type: 'varchar'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(200)
  public name: string = '';
  @Column({
    length: 5000,
    type: 'varchar'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(5000)
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
  public createdByUserId: string = '';

  public isInUse(): boolean {
    return (0 < this.distinctVariablePairAppearanceCount) || (0 < this.constantVariablePairExpressionAppearanceCount) || (0 < this.constantPrefixedExpressionAppearanceCount) || (0 < this.standardExpressionAppearanceCount);
  }
};
