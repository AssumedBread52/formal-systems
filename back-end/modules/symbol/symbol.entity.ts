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
    type: 'enum',
    enum: SymbolType
  })
  type: SymbolType = SymbolType.Constant;
  @Column()
  content: string = '';
  @Column()
  axiomaticStatementAppearances: number = 0;
  @Column()
  nonAxiomaticStatementAppearances: number = 0;
  @Column()
  systemId: ObjectId = new ObjectId();
  @Column()
  createdByUserId: ObjectId = new ObjectId();
};
