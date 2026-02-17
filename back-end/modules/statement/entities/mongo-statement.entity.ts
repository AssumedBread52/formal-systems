import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('statement')
export class MongoStatementEntity {
  @ObjectIdColumn()
  public _id: ObjectId = new ObjectId();
  @Column()
  public title: string = '';
  @Column()
  public description: string = '';
  @Column()
  public distinctVariableRestrictions: [ObjectId, ObjectId][] = [];
  @Column()
  public variableTypeHypotheses: [ObjectId, ObjectId][] = [];
  @Column()
  public logicalHypotheses: [ObjectId, ...ObjectId[]][] = [];
  @Column()
  public assertion: [ObjectId, ...ObjectId[]] = [new ObjectId()];
  @Column()
  public proofCount: number = 0;
  @Column()
  public proofAppearanceCount: number = 0;
  @Column()
  public systemId: ObjectId = new ObjectId();
  @Column()
  public createdByUserId: ObjectId = new ObjectId();
};
