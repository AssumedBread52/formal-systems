import { SystemEntity } from '@/system/entities/system.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsEmail, IsNotEmpty, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
@ObjectType()
export class UserEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  public readonly id!: string;
  @Column({
    length: 50,
    type: 'varchar',
    unique: true
  })
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(50)
  public handle: string = '';
  @Column({
    length: 254,
    type: 'varchar',
    unique: true
  })
  @Field((): typeof String => {
    return String;
  })
  @IsEmail()
  @MaxLength(254)
  public email: string = '';
  @Column({
    length: 60,
    name: 'password_hash',
    type: 'char'
  })
  @Exclude()
  @Matches(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
  @MaxLength(60)
  @MinLength(60)
  public passwordHash: string = '';

  @Allow()
  @Exclude()
  @Field((): [typeof SystemEntity] => {
    return [SystemEntity];
  })
  @OneToMany((): typeof SystemEntity => {
    return SystemEntity;
  }, (system: SystemEntity): Promise<UserEntity> => {
    return system.owner;
  })
  public readonly systems!: Promise<SystemEntity[]>;
};
