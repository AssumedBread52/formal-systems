import { InvalidTokenException } from '@/auth/exceptions/invalid-token.exception';
import { TokenPayload } from '@/auth/payloads/token.payload';
import { ValidateService } from '@/auth/services/validate.service';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Strategy } from 'passport-jwt';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements BaseStrategy {
  constructor(private validateService: ValidateService, configService: ConfigService) {
    super({
      jwtFromRequest: JwtStrategy.extractJwt,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JSON_WEB_TOKEN_SECRET')
    });
  }

  validate(payload: any): Promise<UserEntity> {
    const tokenPayload = plainToClass(TokenPayload, payload);

    const errors = validateSync(tokenPayload);

    if (0 !== errors.length) {
      throw new InvalidTokenException();
    }

    const { userId } = tokenPayload;

    return this.validateService.validateUserById(new ObjectId(userId));
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
