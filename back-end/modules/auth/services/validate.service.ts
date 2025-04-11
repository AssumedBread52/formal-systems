import { InvalidCredentialsException } from '@/auth/exceptions/invalid-credentials.exception';
import { InvalidTokenException } from '@/auth/exceptions/invalid-token.exception';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
  }

  async validateUserByCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      email
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const { hashedPassword } = user;

    const matched = compareSync(password, hashedPassword);

    if (!matched) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  async validateUserById(userId: ObjectId): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      _id: userId
    });

    if (!user) {
      throw new InvalidTokenException();
    }

    return user;
  }
};
