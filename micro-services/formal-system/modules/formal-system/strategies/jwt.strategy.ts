import { IdPayload } from '@/formal-system/data-transfer-objects';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JSON_WEB_TOKEN_SECRET
    } as StrategyOptions);
  }

  async validate(idPayload: IdPayload): Promise<IdPayload> {
    return idPayload;
  }
};
