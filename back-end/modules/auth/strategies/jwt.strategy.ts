import { InvalidTokenException } from '@/auth/exceptions/invalid-token.exception';
import { TokenPayload } from '@/auth/payloads/token.payload';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Strategy } from 'passport-jwt';
import { MongoRepository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>, configService: ConfigService) {
    super({
      jwtFromRequest: JwtStrategy.extractJwt,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JSON_WEB_TOKEN_SECRET')
    });
  }

  async validate(payload: any): Promise<UserEntity> {
    const tokenPayload = plainToClass(TokenPayload, payload);

    const errors = validateSync(tokenPayload);

    if (0 !== errors.length) {
      throw new InvalidTokenException();
    }

    const { userId } = tokenPayload;

    const user = await this.userRepository.findOneBy({
      _id: new ObjectId(userId)
    });

    if (!user) {
      throw new InvalidTokenException();
    }

    return user;
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
