import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsEnum, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('symbols')
@ObjectType()
@Unique('symbols_system_name_unique', [
  'system',
  'name'
])
@Unique('symbols_id_system_unique', [
  'system',
  'id'
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
  @Column({
    enum: SymbolType,
    enumName: 'symbol_type',
    type: 'enum'
  })
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  public type: SymbolType = SymbolType.constant;
  @Column({
    length: 250,
    type: 'varchar'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(250)
  public content: string = '';

  @Allow()
  @Exclude()
  @Field((): typeof SystemEntity => {
    return SystemEntity;
  })
  @JoinColumn({
    name: 'system_id'
  })
  @ManyToOne((): typeof SystemEntity => {
    return SystemEntity;
  }, (system: SystemEntity): Promise<SymbolEntity[]> => {
    return system.symbols;
  })
  public readonly system!: Promise<SystemEntity>;
  @Allow()
  @Exclude()
  @Field((): [typeof ExpressionTokenEntity] => {
    return [ExpressionTokenEntity];
  })
  @OneToMany((): typeof ExpressionTokenEntity => {
    return ExpressionTokenEntity;
  }, (expressionToken: ExpressionTokenEntity): Promise<SymbolEntity> => {
    return expressionToken.symbol;
  })
  public readonly expressionTokens!: Promise<ExpressionTokenEntity[]>;
};
