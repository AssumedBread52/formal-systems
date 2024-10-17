import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class CookieService {
  private static TOKEN = 'token';
  private static AUTH_STATUS = 'authStatus';

  constructor(private configService: ConfigService) {
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(CookieService.TOKEN);
    response.clearCookie(CookieService.AUTH_STATUS);
  }

  setAuthCookies(response: Response, token: string): void {
    const maxAge = this.configService.getOrThrow<number>('AUTH_COOKIE_MAX_AGE_MILLISECONDS');

    response.cookie(CookieService.TOKEN, token, {
      httpOnly: true,
      maxAge,
      secure: true
    });
    response.cookie(CookieService.AUTH_STATUS, 'true', {
      maxAge,
      secure: true
    });
  }
};
