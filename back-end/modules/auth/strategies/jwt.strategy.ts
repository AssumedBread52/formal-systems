import { InvalidTokenException } from '@/auth/exceptions/invalid-token.exception';
import { TokenPayload } from '@/auth/payloads/token.payload';
import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UserReadService } from '@/user/services/user-read.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userReadService: UserReadService, configService: ConfigService) {
    super({
      jwtFromRequest: JwtStrategy.extractJwt,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JSON_WEB_TOKEN_SECRET')
    });
  }

  override async validate(payload: any): Promise<UserEntity> {
    try {
      const { userId } = validatePayload(payload, TokenPayload);

      return await this.userReadService.readById(userId);
    } catch {
      throw new InvalidTokenException();
    }
  }

  private static extractJwt(request: Request): string | null {
    const { cookies } = request;

    const { token } = cookies;

    if (!token) {
      return null;
    }

    return token;
  }
};
