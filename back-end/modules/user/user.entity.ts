import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({
  name: 'user'
})
export class UserEntity {
  @ObjectIdColumn()
  _id: ObjectId;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column()
  hashedPassword: string;
};
