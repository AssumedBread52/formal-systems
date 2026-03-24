import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('user')
export class MongoUserEntity {
  @ObjectIdColumn()
  public _id: ObjectId = new ObjectId();
  @Column()
  public firstName: string = '';
  @Column()
  public lastName: string = '';
  @Column()
  public email: string = '';
  @Column()
  public passwordHash: string = '';
  @Column()
  public systemCount: number = 0;
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
};
