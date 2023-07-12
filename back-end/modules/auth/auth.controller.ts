import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { IdPayload } from './data-transfer-objects/id.payload';
import { SignUpPayload } from './data-transfer-objects/sign-up.payload';
import { SessionUser } from './decorators/session-user';
import { JwtGuard } from './guards/jwt.guard';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {
  }

  @UseGuards(JwtGuard)
  @Get('session-user-id')
  getSessionUserId(@SessionUser() sessionUser: UserEntity): IdPayload {
    const { _id } = sessionUser;

    return {
      id: _id.toString()
    };
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
  }
};
