import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserRepository } from '@/user/repositories/user.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class UserReadService {
  public constructor(private readonly userRepository: UserRepository) {
  }

  public async selectByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOneBy({
        email
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Selecting user failed');
    }
  }

  public async selectById(userId: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOneBy({
        id: userId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Selecting user failed');
    }
  }
};
