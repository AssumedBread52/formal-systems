import { UserEntity } from '@/user/entities/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Allow, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantSymbolCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public variableSymbolCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public distinctVariablePairCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantVariablePairExpressionCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantPrefixedExpressionCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public standardExpressionCount: number = 0;
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public createdByUserId: string = '';

  public isNotEmpty(): boolean {
    return (0 < this.constantSymbolCount) || (0 < this.variableSymbolCount) || (0 < this.distinctVariablePairCount) || (0 < this.constantVariablePairExpressionCount) || (0 < this.constantPrefixedExpressionCount) || (0 < this.standardExpressionCount);
  }
};
