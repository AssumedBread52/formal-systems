import { UserDocument } from '@/user/user-schema';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth-service';

const secret = process.env.JSON_WEB_TOKEN_SECRET;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret
    });
  }

  async validate(payload: { _id: string; }): Promise<UserDocument | null> {
    const { _id } = payload;

    const user = await this.authService.validateUserById(_id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
};
