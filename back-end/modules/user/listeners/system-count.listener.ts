import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserRepository } from '@/user/repositories/user.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SystemCountListener {
  constructor(private userRepository: UserRepository) {
  }

  @OnEvent('system.create.completed', {
    suppressErrors: false
  })
  public async incrementSystemCount(system: SystemEntity): Promise<UserEntity> {
    try {
      const validatedSystem = validatePayload(system, SystemEntity);

      const user = await this.userRepository.findOneBy({
        id: validatedSystem.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      user.systemCount++;

      return this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system count on user failed');
    }
  }

  @OnEvent('system.delete.completed', {
    suppressErrors: false
  })
  public async decrementSystemCount(system: SystemEntity): Promise<UserEntity> {
    try {
      const validatedSystem = validatePayload(system, SystemEntity);

      const user = await this.userRepository.findOneBy({
        id: validatedSystem.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      user.systemCount--;

      return this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system count on user failed');
    }
  }
};
