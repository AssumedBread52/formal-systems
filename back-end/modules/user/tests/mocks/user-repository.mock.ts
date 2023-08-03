import { UserEntity } from '@/user/user.entity';

export class UserRepositoryMock {
  findOneBy = jest.fn();

  save = jest.fn((user: UserEntity): UserEntity => {
    return user;
  });
};
