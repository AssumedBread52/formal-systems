import { Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { SessionUserDecorator } from './decorators/session-user.decorator';
import { JwtGuard } from './guards/jwt.guard';
import { LocalGuard } from './guards/local.guard';
import { CookieService } from './services/cookie.service';
import { TokenService } from './services/token.service';

@Controller('auth')
export class AuthController {
  constructor(private cookieService: CookieService, private tokenService: TokenService) {
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  refreshToken(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Res({ passthrough: true }) response: Response): void {
    const token = this.tokenService.generateToken(sessionUserId);

    this.cookieService.setAuthCookies(response, token);
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  signIn(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Res({ passthrough: true }) response: Response): void {
    const token = this.tokenService.generateToken(sessionUserId);

    this.cookieService.setAuthCookies(response, token);
  }

  @UseGuards(JwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) response: Response): void {
    this.cookieService.clearAuthCookies(response);
  }
};
