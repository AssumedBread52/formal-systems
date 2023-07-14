import { UserEntity } from '@/user/user.entity';
import { IsEmail, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

export class UserPayload {
  @IsNotEmpty()
  id: ObjectId;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;
  @IsInt()
  @Min(0)
  systemEntitiesCount: number;

  constructor(user: UserEntity) {
    const { _id, firstName, lastName, email, systemEntitiesCount } = user;

    this.id = _id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.systemEntitiesCount = systemEntitiesCount;
  }
};
