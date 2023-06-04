import { AuthService } from '@/auth/auth.service';
import { IdPayload } from '@/auth/data-transfer-objects/id.payload';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JSON_WEB_TOKEN_SECRET
    } as StrategyOptions);
  }

  validate(idPayload: IdPayload): Promise<UserEntity> {
    const { id } = idPayload;

    return this.authService.validateUserById(id);
  }
};