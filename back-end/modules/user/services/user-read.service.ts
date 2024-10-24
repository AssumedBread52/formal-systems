import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class UserReadService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>, private validateService: ValidateService) {
  }

  async readById(payload: any) {
    const userId = this.validateService.idCheck(payload);

    const user = await this.userRepository.findOneBy({
      _id: userId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
};
