import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('symbol')
export class MongoSymbolEntity {
  @ObjectIdColumn()
  public _id: ObjectId = new ObjectId();
  @Column()
  public title: string = '';
  @Column()
  public description: string = '';
  @Column({
    enum: SymbolType,
    type: 'enum'
  })
  public type: SymbolType = SymbolType.constant;
  @Column()
  public content: string = '';
  @Column()
  public axiomAppearanceCount: number = 0;
  @Column()
  public theoremAppearanceCount: number = 0;
  @Column()
  public deductionAppearanceCount: number = 0;
  @Column()
  public proofAppearanceCount: number = 0;
  @Column()
  public systemId: ObjectId = new ObjectId();
  @Column()
  public createdByUserId: ObjectId = new ObjectId();
};
