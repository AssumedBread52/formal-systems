import { InvalidCredentialsException } from '@/auth/exceptions/invalid-credentials.exception';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcryptjs';
import { Strategy } from 'passport-local';
import { MongoRepository } from 'typeorm';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
    super({
      usernameField: 'email'
    });
  }

  async validate(email: string, password: string): Promise<UserEntity> {
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
};
