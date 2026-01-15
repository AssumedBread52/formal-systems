import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { LocalGuard } from '@/auth/guards/local.guard';
import { AuthService } from '@/auth/services/auth.service';
import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService, private cookieService: CookieService, private tokenService: TokenService) {
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  refreshToken(@SessionUser() sessionUser: UserEntity, @Res({ passthrough: true }) response: Response): void {
    const token = this.tokenService.generateUserToken(sessionUser);

    this.cookieService.setAuthCookies(response, token);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('sign-in')
  @UseGuards(LocalGuard)
  public signIn(@SessionUser() sessionUser: UserEntity, @Res({ passthrough: true }) response: Response): void {
    this.authService.signIn(sessionUser, response);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('sign-out')
  @UseGuards(JwtGuard)
  signOut(@Res({ passthrough: true }) response: Response): void {
    this.authService.signOut(response);
  }
};
