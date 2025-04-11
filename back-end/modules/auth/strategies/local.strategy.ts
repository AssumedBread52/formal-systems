import { InvalidCredentialsException } from '@/auth/exceptions/invalid-credentials.exception';
import { UserEntity } from '@/user/entities/user.entity';
import { UserReadService } from '@/user/services/user-read.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compareSync } from 'bcryptjs';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userReadService: UserReadService) {
    super({
      usernameField: 'email'
    });
  }

  override async validate(email: string, password: string): Promise<UserEntity> {
    const user = await this.readByEmail(email);

    const { hashedPassword } = user;

    const matched = compareSync(password, hashedPassword);

    if (!matched) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  private async readByEmail(email: string): Promise<UserEntity> {
    try {
      return await this.userReadService.readByEmail(email);
    } catch {
      throw new InvalidCredentialsException();
    }
  }
};
