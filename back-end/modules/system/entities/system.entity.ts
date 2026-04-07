import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('systems')
@ObjectType()
@Unique('systems_owner_name_unique', [
  'owner',
  'name'
])
export class SystemEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  public id!: string;
  @Column({
    name: 'owner_user_id',
    type: 'uuid'
  })
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public ownerUserId: string = '';
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
  @Field((): typeof UserEntity => {
    return UserEntity;
  })
  @JoinColumn({
    name: 'owner_user_id'
  })
  @ManyToOne((): typeof UserEntity => {
    return UserEntity;
  }, (user: UserEntity): Promise<SystemEntity[]> => {
    return user.systems;
  })
  public readonly owner!: Promise<UserEntity>;
  @Allow()
  @Exclude()
  @Field((): [typeof SymbolEntity] => {
    return [SymbolEntity];
  })
  @OneToMany((): typeof SymbolEntity => {
    return SymbolEntity;
  }, (symbol: SymbolEntity): Promise<SystemEntity> => {
    return symbol.system;
  })
  public readonly symbols!: Promise<SymbolEntity[]>;
};
