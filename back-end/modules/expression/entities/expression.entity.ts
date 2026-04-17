import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsUUID } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
};
