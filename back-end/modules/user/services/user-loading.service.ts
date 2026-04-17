import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class UserLoadingService {
  public constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
  }

  public readonly loaderByIds = new DataLoader(async (userIds: readonly string[]): Promise<UserEntity[]> => {
    try {
      const users = await this.repository.findBy({
        id: In(userIds)
      });

      const usersMap = users.reduce((map: Map<string, UserEntity>, user: UserEntity): Map<string, UserEntity> => {
        if (!map.has(user.id)) {
          map.set(user.id, user);
        }

        return map;
      }, new Map<string, UserEntity>());

      return userIds.map((userId: string): UserEntity => {
        const user = usersMap.get(userId);

        if (!user) {
          throw new UserNotFoundException();
        }

        return user;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Loading users by ID failed');
    }
  });
};
