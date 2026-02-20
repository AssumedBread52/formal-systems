import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('distinct-variable-pair')
export class MongoDistinctVariablePairEntity {
  @ObjectIdColumn()
  public _id: ObjectId = new ObjectId();
  @Column()
  public variableSymbolIds: [ObjectId, ObjectId] = [new ObjectId(), new ObjectId()];
  @Column()
  public systemId: ObjectId = new ObjectId();
  @Column()
  public createdByUserId: ObjectId = new ObjectId();
};
