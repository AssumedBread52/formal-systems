import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class CookieService {
  private static readonly TOKEN = 'token';
  private static readonly AUTH_STATUS = 'authStatus';

  public constructor(private readonly configService: ConfigService) {
  }

  public clearAuthCookies(response: Response): void {
    try {
      response.clearCookie(CookieService.TOKEN);
      response.clearCookie(CookieService.AUTH_STATUS);
    } catch {
      throw new Error('Clearing token and authentication status cookies failed');
    }
  }

  public setAuthCookies(response: Response, token: string): void {
    try {
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
    } catch {
      throw new Error('Setting token and authentication status cookies failed');
    }
  }
};
