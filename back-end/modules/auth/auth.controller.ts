import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '@/user/user.service';
import { JwtGuard } from './guards/jwt.guard';
import { SessionUser } from './decorators/session-user';
import { UserEntity } from '@/user/user.entity';
import { IdPayload } from './data-transfer-objects/id.payload';
import { TokenPayload } from './data-transfer-objects/token.payload';
import { LocalGuard } from './guards/local.guard';
import { SignUpPayload } from './data-transfer-objects/sign-up.payload';

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
  refreshToken(@SessionUser() sessionUser: UserEntity): Promise<TokenPayload> {
    return this.authService.generateTokenPayload(sessionUser);
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  signIn(@SessionUser() sessionUser: UserEntity): Promise<TokenPayload> {
    return this.authService.generateTokenPayload(sessionUser);
  }

  @UseGuards(JwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(): void {
  }

  @Post('sign-up')
  async signUp(@Body(ValidationPipe) signUpPayload: SignUpPayload): Promise<TokenPayload> {
    const user = await this.userService.create(signUpPayload);

    return this.authService.generateTokenPayload(user);
  }
};
