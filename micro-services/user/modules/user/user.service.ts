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
    const { firstName, lastName, email, password } = editProfilePayload;

    sessionUser.firstName = firstName;
    sessionUser.lastName = lastName;
    sessionUser.email = email;
    if (password) {
      sessionUser.hashedPassword = await hash(password, 12);
    }

    return sessionUser.save();
  }
};
