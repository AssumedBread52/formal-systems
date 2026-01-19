import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserRepository } from '@/user/repositories/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserReadService {
  constructor(private userRepository: UserRepository) {
  }

  async readById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.readById({
      userId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
};
