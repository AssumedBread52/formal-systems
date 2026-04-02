import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class UserBySystemService {
  public constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
  }

  public readonly loader = new DataLoader(async (ownerUserIds: readonly string[]): Promise<UserEntity[]> => {
    try {
      const users = await this.repository.find({
        where: {
          id: In(ownerUserIds)
        }
      });

      const usersMap = users.reduce((map: Map<string, UserEntity>, user: UserEntity): Map<string, UserEntity> => {
        if (!map.has(user.id)) {
          map.set(user.id, user);
        }

        return map;
      }, new Map<string, UserEntity>());

      return ownerUserIds.map((ownerUserId: string): UserEntity => {
        const user = usersMap.get(ownerUserId);

        if (!user) {
          throw new UserNotFoundException();
        }

        return user;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Loading users failed');
    }
  })
};
