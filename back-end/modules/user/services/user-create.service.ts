import { UserEntity } from '@/user/entities/user.entity';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class UserCreateService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>, private validateService: ValidateService) {
  }

  async create(payload: any): Promise<UserEntity> {
    const newUserPayload = this.validateService.payloadCheck(payload, NewUserPayload);

    const { firstName, lastName, email, password } = newUserPayload;

    await this.validateService.conflictCheck(email);

    const user = new UserEntity();

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync(password, 12);

    return this.userRepository.save(user);
  }
};
