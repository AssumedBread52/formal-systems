import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpPayload } from './data-transfer-objects/sign-up.payload';
import { SessionUser } from './decorators/session-user';
import { JwtGuard } from './guards/jwt.guard';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refreshToken(@SessionUser() sessionUser: UserEntity, @Res({ passthrough: true }) response: Response): Promise<void> {
    const token = await this.authService.generateToken(sessionUser);

    this.setTokenCookie(response, token);
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signIn(@SessionUser() sessionUser: UserEntity, @Res({ passthrough: true }) response: Response): Promise<void> {
    const token = await this.authService.generateToken(sessionUser);

    this.setTokenCookie(response, token);
  }

  @UseGuards(JwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie('token');
    response.clearCookie('authStatus');
  }

  @Post('sign-up')
  async signUp(@Body(ValidationPipe) signUpPayload: SignUpPayload, @Res({ passthrough: true }) response: Response): Promise<void> {
    const user = await this.userService.create(signUpPayload);

    const token = await this.authService.generateToken(user);

    this.setTokenCookie(response, token);
  }

  private setTokenCookie(response: Response, token: string): void {
    response.cookie('token', token, {
      httpOnly: true,
      maxAge: 60000,
      secure: true
    });
    response.cookie('authStatus', 'true', {
      maxAge: 60000,
      secure: true
    });
  }
};
