import { IdPayload } from '@/user/data-transfer-objects';
import { UserDocument } from '@/user/user.schema';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JSON_WEB_TOKEN_SECRET
    } as StrategyOptions);
  }

  async validate(idPayload: IdPayload): Promise<UserDocument> {
    const { id } = idPayload;

    const user = await this.userService.readById(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
};
