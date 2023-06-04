import { UserEntity } from '@/user/user.entity';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserPayload {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;

  constructor(user: UserEntity) {
    const { _id, firstName, lastName, email } = user;

    this.id = _id.toString();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
};
