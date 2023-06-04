import { AuthService } from '@/auth/auth.service';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email'
    } as IStrategyOptions);
  }

  validate(email: string, password: string): Promise<UserEntity> {
    return this.authService.validateUserByCredentials(email, password);
  }
};
