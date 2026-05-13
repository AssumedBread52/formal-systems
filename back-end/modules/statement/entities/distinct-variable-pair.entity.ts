import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsUUID } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { StatementEntity } from './statement.entity';

@Entity('statement_distinct_variable_pairs')
@ObjectType()
export class DistinctVariablePairEntity {
  @Column({
    name: 'system_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public systemId: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  @PrimaryColumn({
    name: 'statement_id',
    type: 'uuid'
  })
  public statementId: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  @PrimaryColumn({
    name: 'variable_symbol_1_id',
    type: 'uuid'
  })
  public variableSymbol1Id: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  @PrimaryColumn({
    name: 'variable_symbol_2_id',
    type: 'uuid'
  })
  public variableSymbol2Id: string = '';

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
  }, (system: SystemEntity): Promise<DistinctVariablePairEntity[]> => {
    return system.distinctVariablePairs;
  })
  public readonly system!: Promise<SystemEntity>;
  @Allow()
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
  }, (statement: StatementEntity): Promise<DistinctVariablePairEntity[]> => {
    return statement.distinctVariablePairs;
  })
  public readonly statement!: Promise<StatementEntity>;
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
      name: 'variable_symbol_1_id',
      referencedColumnName: 'id'
    }
  ])
  @ManyToOne((): typeof SymbolEntity => {
    return SymbolEntity;
  }, (symbol: SymbolEntity): Promise<DistinctVariablePairEntity[]> => {
    return symbol.distinctVariable1Pairs;
  })
  public readonly variableSymbol1!: Promise<SymbolEntity>;
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
      name: 'variable_symbol_2_id',
      referencedColumnName: 'id'
    }
  ])
  @ManyToOne((): typeof SymbolEntity => {
    return SymbolEntity;
  }, (symbol: SymbolEntity): Promise<DistinctVariablePairEntity[]> => {
    return symbol.distinctVariable2Pairs;
  })
  public readonly variableSymbol2!: Promise<SymbolEntity>;
};
