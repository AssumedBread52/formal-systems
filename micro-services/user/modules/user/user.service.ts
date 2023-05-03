import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
};
