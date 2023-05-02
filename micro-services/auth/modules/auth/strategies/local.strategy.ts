import { AuthService } from '@/auth/auth.service';
import { ServerUser } from '@/auth/data-transfer-objects';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email'
    });
  }

  validate(email: string, password: string): Promise<ServerUser> {
    return this.authService.validateUserByCredentials(email, password);
  }
};
