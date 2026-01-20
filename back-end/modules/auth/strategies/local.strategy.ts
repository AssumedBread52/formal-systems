import { InvalidCredentialsException } from '@/auth/exceptions/invalid-credentials.exception';
import { UserEntity } from '@/user/entities/user.entity';
import { UserRepository } from '@/user/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compareSync } from 'bcryptjs';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly userRepository: UserRepository) {
    super({
      usernameField: 'email'
    });
  }

  public override async validate(email: string, password: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOneBy({
        email
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!compareSync(password, user.hashedPassword)) {
        throw new Error('Invalid password');
      }

      return user;
    } catch {
      throw new InvalidCredentialsException();
    }
  }
};
