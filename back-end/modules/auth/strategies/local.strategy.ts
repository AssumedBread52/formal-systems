import { InvalidCredentialsException } from '@/auth/exceptions/invalid-credentials.exception';
import { UserEntity } from '@/user/entities/user.entity';
import { UserReadService } from '@/user/services/user-read.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compareSync } from 'bcryptjs';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly userReadService: UserReadService) {
    super({
      usernameField: 'email'
    });
  }

  public override async validate(email: string, password: string): Promise<UserEntity> {
    try {
      const user = await this.userReadService.selectByEmail(email);

      if (!compareSync(password, user.hashedPassword)) {
        throw new Error('Invalid password');
      }

      return user;
    } catch {
      throw new InvalidCredentialsException();
    }
  }
};
