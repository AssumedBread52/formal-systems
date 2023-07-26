import { EntityRepositoryMock } from '@/common/tests/mocks/entity-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { hash } from 'bcryptjs';

export class UserRepositoryMock extends EntityRepositoryMock<UserEntity> {
  findOneBy = jest.fn((args: Partial<UserEntity>): UserEntity | null => {
    const { _id, email } = args;

    for (const user of this.entities) {
      if ((!_id || _id.toString() === user._id.toString()) && (!email || email === user.email)) {
        return user;
      }
    }

    return null;
  });

  private generateUsers = async (count: number): Promise<void> => {
    if (this.entities.length >= count) {
      return;
    }

    for (let index = this.entities.length; index < count; index++) {
      const user = new UserEntity();

      user.firstName = `Test${index}`;
      user.lastName = `User${index}`;
      user.email = `test${index}@test.com`;
      user.hashedPassword = await hash('123456', 12);

      this.entities.push(user);
    }
  };

  retrieveUser = async (index: number): Promise<UserEntity> => {
    await this.generateUsers(index + 1);

    return this.entities[index];
  }
};
