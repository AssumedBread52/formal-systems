import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  firstName: string = '';
  @Column()
  lastName: string = '';
  @Column()
  email: string = '';
  @Column()
  hashedPassword: string = '';
  @Column()
  systemCount: number = 0;
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
};
