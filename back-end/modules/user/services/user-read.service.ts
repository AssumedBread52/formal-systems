import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { UniqueHandleException } from '@/user/exceptions/unique-handle.exception';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { PaginatedUsersPayload } from '@/user/payloads/paginated-users.payload';
import { SearchUsersPayload } from '@/user/payloads/search-users.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class UserReadService {
  public constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
  }

  public async searchUsers(searchUsersPayload: SearchUsersPayload): Promise<PaginatedUsersPayload> {
    try {
      const validatedSearchUsersPayload = validatePayload(searchUsersPayload, SearchUsersPayload);

      const take = validatedSearchUsersPayload.pageSize;
      const skip = (validatedSearchUsersPayload.page - 1) * validatedSearchUsersPayload.pageSize;

      const where = [] as FindOptionsWhere<UserEntity>[];
      const textFilter = ILike(`%${validatedSearchUsersPayload.searchText}%`);
      if (0 < validatedSearchUsersPayload.searchText.length) {
        where.push({
          handle: textFilter
        });
        where.push({
          email: textFilter
        });
      }

      const [users, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedUsersPayload(users, total);
    } catch {
      throw new InternalServerErrorException('Reading users failed');
    }
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

      throw new InternalServerErrorException('Reading user failed');
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

      throw new InternalServerErrorException('Reading user failed');
    }
  }

  public async verifyUniqueHandle(handle: string): Promise<void> {
    try {
      const conflict = await this.repository.existsBy({
        handle
      });

      if (conflict) {
        throw new UniqueHandleException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique handle failed');
    }
  }

  public async verifyUniqueEmail(email: string): Promise<void> {
    try {
      const conflict = await this.repository.existsBy({
        email
      });

      if (conflict) {
        throw new UniqueEmailAddressException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique e-mail address failed');
    }
  }
};
