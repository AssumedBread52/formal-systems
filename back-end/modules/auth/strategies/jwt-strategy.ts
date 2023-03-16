import { AuthService } from '@/auth/auth-service';
import { JwtPayload } from '@/auth/types';
import { UserDocument } from '@/user/user-schema';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

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

  async validate(payload: JwtPayload): Promise<UserDocument> {
    const { id } = payload;

    const user = await this.authService.validateUserId(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
};
