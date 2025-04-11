import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class UserReadService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>, private validateService: ValidateService) {
  }

  async readById(userId: any): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      _id: this.validateService.idCheck(userId)
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
};
