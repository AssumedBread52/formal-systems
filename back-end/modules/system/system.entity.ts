import { UserEntity } from '@/user/user.entity';
import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('system')
export class SystemEntity {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId();
  @Column()
  title: string = '';
  @Column()
  urlPath: string = '';
  @Column()
  description: string = '';
  @Column()
  createdByUserId: ObjectId = new ObjectId();
  @Column({
    nullable: true
  })
  createdByUser?: UserEntity;
};
