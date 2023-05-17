import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserDocument } from '../user.schema';

export class ClientUser {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;

  constructor(userDocument: UserDocument) {
    const { _id, firstName, lastName, email } = userDocument;

    this.id = _id.toString();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
};
