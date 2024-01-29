import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('grouping')
export class GroupingEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  title: string = '';
  @Column()
  description: string = '';
  @Column()
  groupingId: ObjectId | null = null;
  @Column()
  ancestorIds: ObjectId[] = [];
  @Column()
  systemId: ObjectId = new ObjectId();
  @Column()
  createdByUserId: ObjectId = new ObjectId();
};
