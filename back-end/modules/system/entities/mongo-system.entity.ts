import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('system')
export class MongoSystemEntity {
  @ObjectIdColumn()
  public _id: ObjectId = new ObjectId();
  @Column()
  public title: string = '';
  @Column()
  public description: string = '';
  @Column()
  public constantSymbolCount: number = 0;
  @Column()
  public variableSymbolCount: number = 0;
  @Column()
  public distinctVariablePairCount: number = 0;
  @Column()
  public constantVariablePairExpressionCount: number = 0;
  @Column()
  public constantPrefixedExpressionCount: number = 0;
  @Column()
  public standardExpressionCount: number = 0;
  @Column()
  public createdByUserId: ObjectId = new ObjectId();
};
