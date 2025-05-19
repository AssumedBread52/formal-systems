import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { CompositeAdapterRepository } from '@/user/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserReadService {
  constructor(private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async readByEmail(email: string): Promise<UserEntity> {
    const user = await this.compositeAdapterRepository.readByEmail({
      email
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async readById(userId: string): Promise<UserEntity> {
    const user = await this.compositeAdapterRepository.readById({
      userId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
};
