import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('statement')
export class GroupingEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  systemId: ObjectId = new ObjectId();
  @Column()
  createdByUserId: ObjectId = new ObjectId();
};
