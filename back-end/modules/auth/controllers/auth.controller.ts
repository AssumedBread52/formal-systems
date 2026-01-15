import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { LocalGuard } from '@/auth/guards/local.guard';
import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private cookieService: CookieService, private tokenService: TokenService) {
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  refreshToken(@SessionUser() sessionUser: UserEntity, @Res({ passthrough: true }) response: Response): void {
    const token = this.tokenService.generateUserToken(sessionUser);

    this.cookieService.setAuthCookies(response, token);
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  signIn(@SessionUser() sessionUser: UserEntity, @Res({ passthrough: true }) response: Response): void {
    const token = this.tokenService.generateUserToken(sessionUser);

    this.cookieService.setAuthCookies(response, token);
  }

  @UseGuards(JwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) response: Response): void {
    this.cookieService.clearAuthCookies(response);
  }
};
