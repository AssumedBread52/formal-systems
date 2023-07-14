import { UserEntity } from '@/user/user.entity';
import { IsEmail, IsInt, IsNotEmpty, Min } from 'class-validator';

export class UserPayload {
  @IsNotEmpty()
  id: string;
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

    this.id = _id.toString();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.systemEntitiesCount = systemEntitiesCount;
  }
};
