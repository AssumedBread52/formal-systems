import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { EditProfilePayload } from './data-transfer-objects';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
  }

  create(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user);

    return newUser.save();
  }

  readByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      email
    }).exec();
  }

  readById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async update(sessionUser: UserDocument, editProfilePayload: EditProfilePayload): Promise<UserDocument> {
    const { newFirstName, newLastName, newEmail, newPassword } = editProfilePayload;

    sessionUser.firstName = newFirstName;
    sessionUser.lastName = newLastName;
    sessionUser.email = newEmail;
    if (newPassword) {
      sessionUser.hashedPassword = await hash(newPassword, 12);
    }

    return sessionUser.save();
  }
};
