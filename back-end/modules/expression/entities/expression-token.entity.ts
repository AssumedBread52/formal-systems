import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsInt, IsUUID, Min } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ExpressionEntity } from './expression.entity';

@Entity('expression_tokens')
@ObjectType()
export class ExpressionTokenEntity {
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
    name: 'symbol_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public symbolId: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  @PrimaryColumn({
    name: 'expression_id',
    type: 'uuid'
  })
  public expressionId: string = '';
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  @PrimaryColumn({
    type: 'integer'
  })
  public position: number = 0;

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
  }, (system: SystemEntity): Promise<ExpressionTokenEntity[]> => {
    return system.expressionTokens;
  })
  public readonly system!: Promise<SystemEntity>;
  @Allow()
  @Exclude()
  @Field((): typeof SymbolEntity => {
    return SymbolEntity;
  })
  @JoinColumn([
    {
      name: 'system_id',
      referencedColumnName: 'systemId'
    },
    {
      name: 'symbol_id',
      referencedColumnName: 'id'
    }
  ])
  @ManyToOne((): typeof SymbolEntity => {
    return SymbolEntity;
  }, (symbol: SymbolEntity): Promise<ExpressionTokenEntity[]> => {
    return symbol.expressionTokens;
  })
  public readonly symbol!: Promise<SymbolEntity>;
  @Allow()
  @Exclude()
  @Field((): typeof ExpressionEntity => {
    return ExpressionEntity;
  })
  @JoinColumn([
    {
      name: 'system_id',
      referencedColumnName: 'systemId'
    },
    {
      name: 'expression_id',
      referencedColumnName: 'id'
    }
  ])
  @ManyToOne((): typeof ExpressionEntity => {
    return ExpressionEntity;
  }, (expression: ExpressionEntity): Promise<ExpressionTokenEntity[]> => {
    return expression.expressionTokens;
  })
  public readonly expression!: Promise<ExpressionEntity>;
};
