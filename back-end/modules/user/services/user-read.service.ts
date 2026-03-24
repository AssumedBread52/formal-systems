import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserReadService {
  public constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
  }

  public async selectByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.repository.findOneBy({
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
      const user = await this.repository.findOneBy({
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
