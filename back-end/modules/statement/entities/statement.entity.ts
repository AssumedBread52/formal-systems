import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { DistinctVariablePairEntity } from './distinct-variable-pair.entity';
import { HypothesisEntity } from './hypothesis.entity';

@Entity('statements')
@ObjectType()
@Unique('statements_system_id_name_unique', [
  'system',
  'name'
])
@Unique('statements_system_id_id_unique', [
  'system',
  'id'
])
export class StatementEntity {
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
    name: 'assertion_expression_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public assertionExpressionId: string = '';
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
  }, (system: SystemEntity): Promise<StatementEntity[]> => {
    return system.statements;
  })
  public readonly system!: Promise<SystemEntity>;
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
      name: 'assertion_expression_id',
      referencedColumnName: 'id'
    }
  ])
  @ManyToOne((): typeof ExpressionEntity => {
    return ExpressionEntity;
  }, (expression: ExpressionEntity): Promise<StatementEntity[]> => {
    return expression.statements;
  })
  public readonly assertion!: Promise<ExpressionEntity>;
  @Allow()
  @Exclude()
  @Field((): [typeof HypothesisEntity] => {
    return [HypothesisEntity];
  })
  @OneToMany((): typeof HypothesisEntity => {
    return HypothesisEntity;
  }, (hypothesis: HypothesisEntity): Promise<StatementEntity> => {
    return hypothesis.statement;
  })
  public readonly hypotheses!: Promise<HypothesisEntity[]>;
  @Allow()
  @Exclude()
  @Field((): [typeof DistinctVariablePairEntity] => {
    return [DistinctVariablePairEntity];
  })
  @OneToMany((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  }, (distinctVariablePair: DistinctVariablePairEntity): Promise<StatementEntity> => {
    return distinctVariablePair.statement;
  })
  public readonly distinctVariablePairs!: Promise<DistinctVariablePairEntity[]>;
};
