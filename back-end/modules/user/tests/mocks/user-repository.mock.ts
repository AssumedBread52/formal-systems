import { UserEntity } from '@/user/user.entity';
import { hash } from 'bcryptjs';

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
    this.users.push(args);

    return args;
  });

  private generateUsers = async (count: number): Promise<void> => {
    if (this.users.length >= count) {
      return;
    }

    for (let index = this.users.length; index < count; index++) {
      const user = new UserEntity();

      user.firstName = `Test${index}`;
      user.lastName = `User${index}`;
      user.email = `test${index}@test.com`;
      user.hashedPassword = await hash('123456', 12);

      this.users.push(user);
    }
  };

  retrieveUser = async (index: number): Promise<UserEntity> => {
    await this.generateUsers(index + 1);

    return this.users[index];
  }
};
