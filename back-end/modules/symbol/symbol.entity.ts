import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { SymbolType } from './enums/symbol-type.enum';

@Entity('symbol')
export class SymbolEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  title: string = '';
  @Column()
  description: string = '';
  @Column({
    enum: SymbolType,
    type: 'enum'
  })
  type: SymbolType = SymbolType.Constant;
  @Column()
  content: string = '';
  @Column()
  axiomAppearanceCount: number = 0;
  @Column()
  theoremAppearanceCount: number = 0;
  @Column()
  deductionAppearanceCount: number = 0;
  @Column()
  systemId: ObjectId = new ObjectId();
  @Column()
  createdByUserId: ObjectId = new ObjectId();
};
