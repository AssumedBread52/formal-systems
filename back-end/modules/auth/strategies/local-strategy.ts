import { AuthService } from '@/auth/auth-service';
import { UserDocument } from '@/user/user-schema';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email'
    });
  }

  async validate(email: string, password: string): Promise<UserDocument> {
    const user = await this.authService.validateUserCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
};
