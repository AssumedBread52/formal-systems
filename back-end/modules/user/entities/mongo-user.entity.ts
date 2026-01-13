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
  public hashedPassword: string = '';
  @Column()
  public systemCount: number = 0;
  @Column()
  public constantSymbolCount: number = 0;
  @Column()
  public variableSymbolCount: number = 0;
  @Column()
  public axiomCount: number = 0;
  @Column()
  public theoremCount: number = 0;
  @Column()
  public deductionCount: number = 0;
  @Column()
  public proofCount: number = 0;
};
