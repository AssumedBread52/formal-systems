import { UserEntity } from '@/user/entities/user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { CookieService } from './cookie.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  public constructor(private readonly cookieService: CookieService, private readonly tokenService: TokenService) {
  }

  public signIn(sessionUser: UserEntity, response: Response): void {
    try {
      const token = this.tokenService.generateUserToken(sessionUser);

      this.cookieService.setAuthCookies(response, token);
    } catch {
      throw new InternalServerErrorException('Sign in failed');
    }
  }

  public signOut(response: Response): void {
    try {
      this.cookieService.clearAuthCookies(response);
    } catch {
      throw new InternalServerErrorException('Sign out failed');
    }
  }
};
