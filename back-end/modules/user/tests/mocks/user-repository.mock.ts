import { UserEntity } from '@/user/user.entity';
import { ObjectId } from 'mongodb';

export class UserRepositoryMock {
  users = [] as UserEntity[];

  findOneBy = jest.fn((args: Partial<UserEntity>): UserEntity | null => {
    const { _id, email } = args;

    for (const user of this.users) {
      if ((!_id || _id.toString() === user._id.toString()) && (!email || email === user.email)) {
        return user;
      }
    }

    return null;
  });

  save = jest.fn((args: UserEntity): UserEntity => {
    args._id = new ObjectId();

    this.users.push(args);

    return args;
  });
};
