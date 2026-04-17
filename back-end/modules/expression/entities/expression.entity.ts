import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsUUID } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ExpressionTokenEntity } from './expression-token.entity';

@Entity('expressions')
@ObjectType()
@Unique('expressions_system_canonical_unique', [
  'system',
  'canonical'
])
@Unique('expressions_id_system_unique', [
  'system',
  'id'
])
export class ExpressionEntity {
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
    array: true,
    type: 'uuid'
  })
  @Field((): [typeof String] => {
    return [String];
  })
  @IsUUID('all', {
    each: true
  })
  public canonical: string[] = [];

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
  }, (system: SystemEntity): Promise<ExpressionEntity[]> => {
    return system.expressions;
  })
  public readonly system!: Promise<SystemEntity>;
  @Allow()
  @Exclude()
  @Field((): [typeof ExpressionTokenEntity] => {
    return [ExpressionTokenEntity];
  })
  @OneToMany((): typeof ExpressionTokenEntity => {
    return ExpressionTokenEntity;
  }, (expressionToken: ExpressionTokenEntity): Promise<ExpressionEntity> => {
    return expressionToken.expression;
  })
  public readonly expressionTokens!: Promise<ExpressionTokenEntity[]>;
};
