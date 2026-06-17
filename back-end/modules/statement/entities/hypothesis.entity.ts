import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { StatementEntity } from './statement.entity';

@Entity('statement_hypotheses')
@ObjectType()
@Unique('statement_hypotheses_system_id_id_unique', [
  'system',
  'id'
])
@Unique('statement_hypotheses_system_id_statement_id_id_unique', [
  'system',
  'statement',
  'id'
])
@Unique('statement_hypotheses_statement_id_expression_id_unique', [
  'statement',
  'expression'
])
export class HypothesisEntity {
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
    name: 'statement_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public statementId: string = '';
  @Column({
    name: 'expression_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public expressionId: string = '';
  @Column({
    enum: HypothesisType,
    enumName: 'hypothesis_type',
    type: 'enum'
  })
  @Field((): typeof HypothesisType => {
    return HypothesisType;
  })
  @IsEnum(HypothesisType)
  public type: HypothesisType = HypothesisType.logic;

  @Exclude()
  @Field((): typeof SystemEntity => {
    return SystemEntity;
  })
  @JoinColumn({
    name: 'system_id'
  })
  @ManyToOne((): typeof SystemEntity => {
    return SystemEntity;
  }, (system: SystemEntity): Promise<HypothesisEntity[]> => {
    return system.hypotheses;
  })
  public readonly system!: Promise<SystemEntity>;
  @Exclude()
  @Field((): typeof StatementEntity => {
    return StatementEntity;
  })
  @JoinColumn([
    {
      name: 'system_id',
      referencedColumnName: 'systemId'
    },
    {
      name: 'statement_id',
      referencedColumnName: 'id'
    }
  ])
  @ManyToOne((): typeof StatementEntity => {
    return StatementEntity;
  }, (statement: StatementEntity): Promise<HypothesisEntity[]> => {
    return statement.hypotheses;
  })
  public readonly statement!: Promise<StatementEntity>;
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
  }, (expression: ExpressionEntity): Promise<HypothesisEntity[]> => {
    return expression.hypotheses;
  })
  public readonly expression!: Promise<ExpressionEntity>;
};
