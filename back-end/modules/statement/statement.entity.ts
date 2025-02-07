import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('statement')
export class StatementEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  title: string = '';
  @Column()
  description: string = '';
  @Column()
  distinctVariableRestrictions: [ObjectId, ObjectId][] = [];
  @Column()
  variableTypeHypotheses: [ObjectId, ObjectId][] = [];
  @Column()
  logicalHypotheses: [ObjectId, ...ObjectId[]][] = [];
  @Column()
  assertion: [ObjectId, ...ObjectId[]] = [new ObjectId()];
  @Column()
  proofCount: number = 0;
  @Column()
  proofAppearanceCount: number = 0;
  @Column()
  systemId: ObjectId = new ObjectId();
  @Column()
  createdByUserId: ObjectId = new ObjectId();
};
