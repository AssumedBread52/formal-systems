import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { Injectable } from '@nestjs/common';
import { UserPort } from './port/user.port';

@Injectable()
export class UserReadService {
  constructor(private userPort: UserPort) {
  }

  async readByEmail(email: string): Promise<UserEntity> {
    const user = await this.userPort.readByEmail({
      email
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async readById(userId: string): Promise<UserEntity> {
    const user = await this.userPort.readById({
      userId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
};
