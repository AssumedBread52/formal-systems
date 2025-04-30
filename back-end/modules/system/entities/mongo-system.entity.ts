import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('system')
export class MongoSystemEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  title: string = '';
  @Column()
  description: string = '';
  @Column()
  constantSymbolCount: number = 0;
  @Column()
  variableSymbolCount: number = 0;
  @Column()
  axiomCount: number = 0;
  @Column()
  theoremCount: number = 0;
  @Column()
  deductionCount: number = 0;
  @Column()
  proofCount: number = 0;
  @Column()
  createdByUserId: ObjectId = new ObjectId();
};
