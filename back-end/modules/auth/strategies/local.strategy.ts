import { ValidateService } from '@/auth/services/validate.service';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private validateService: ValidateService) {
    super({
      usernameField: 'email'
    } as IStrategyOptions);
  }

  validate(email: string, password: string): Promise<UserEntity> {
    return this.validateService.validateUserByCredentials(email, password);
  }
};
