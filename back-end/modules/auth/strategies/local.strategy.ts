import { ValidateService } from '@/auth/services/validate.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private validateService: ValidateService) {
    super({
      usernameField: 'email'
    });
  }

  validate(email: string, password: string): Promise<UserEntity> {
    return this.validateService.validateUserByCredentials(email, password);
  }
};
