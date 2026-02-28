import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('expression')
export class MongoExpressionEntity {
  @ObjectIdColumn()
  public _id: ObjectId = new ObjectId();
  @Column()
  public symbolIds: ObjectId[] = [];
  @Column({
    enum: ExpressionType,
    type: 'enum'
  })
  public type: ExpressionType = ExpressionType.standard;
  @Column()
  public systemId: ObjectId = new ObjectId();
  @Column()
  public createdByUserId: ObjectId = new ObjectId();
};
