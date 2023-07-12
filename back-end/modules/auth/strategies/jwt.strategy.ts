import { AuthService } from '@/auth/auth.service';
import { IdPayload } from '@/auth/data-transfer-objects/id.payload';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private authService: AuthService, configService: ConfigService) {
    super({
      jwtFromRequest: JwtStrategy.extractJwt,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JSON_WEB_TOKEN_SECRET')
    } as StrategyOptions);
  }

  private static extractJwt(request: Request): string | null {
    const { cookies } = request;

    if (!cookies) {
      return null;
    }

    const { token } = cookies;

    if (!token) {
      return null;
    }

    return token;
  }

  validate(idPayload: IdPayload): Promise<UserEntity> {
    const { id } = idPayload;

    return this.authService.validateUserById(id);
  }
};
