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

  public loadById(userId: string): Promise<UserEntity> {
    return this.loaderByIds.load(userId);
  }

  private readonly loaderByIds = new DataLoader(async (userIds: readonly string[]): Promise<UserEntity[]> => {
    try {
      const users = await this.repository.findBy({
        id: In(userIds)
      });

      const usersMap = new Map(users.map((user: UserEntity): [string, UserEntity] => {
        return [user.id, user];
      }));

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
