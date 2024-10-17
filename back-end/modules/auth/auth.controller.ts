import { UserService } from '@/user/user.service';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthService } from './auth.service';
import { SessionUserDecorator } from './decorators/session-user.decorator';
import { JwtGuard } from './guards/jwt.guard';
import { LocalGuard } from './guards/local.guard';
import { SignUpPayload } from './payloads/sign-up.payload';
import { CookieService } from './services/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private cookieService: CookieService, private userService: UserService) {
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refreshToken(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Res({ passthrough: true }) response: Response): Promise<void> {
    const token = await this.authService.generateToken(sessionUserId);

    this.cookieService.setAuthCookies(response, token);
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signIn(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Res({ passthrough: true }) response: Response): Promise<void> {
    const token = await this.authService.generateToken(sessionUserId);

    this.cookieService.setAuthCookies(response, token);
  }

  @UseGuards(JwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) response: Response): void {
    this.cookieService.clearAuthCookies(response);
  }

  @Post('sign-up')
  async signUp(@Body(ValidationPipe) signUpPayload: SignUpPayload, @Res({ passthrough: true }) response: Response): Promise<void> {
    const { _id } = await this.userService.create(signUpPayload);

    const token = await this.authService.generateToken(_id);

    this.cookieService.setAuthCookies(response, token);
  }
};
