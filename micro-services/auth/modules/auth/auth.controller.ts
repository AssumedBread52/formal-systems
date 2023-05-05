import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload, ServerUser, SignUpPayload } from './data-transfer-objects';
import { SessionUser } from './decorators';
import { JwtGuard, LocalGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  refreshToken(@SessionUser() sessionUser: ServerUser): Promise<JwtPayload> {
    return this.authService.generateJwtPayload(sessionUser);
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  signIn(@SessionUser() sessionUser: ServerUser): Promise<JwtPayload> {
    return this.authService.generateJwtPayload(sessionUser);
  }

  @UseGuards(JwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(): void {
  }

  @Post('sign-up')
  async signUp(@Body(new ValidationPipe()) signUpPayload: SignUpPayload): Promise<JwtPayload> {
    const user = await this.authService.createUser(signUpPayload);

    return this.authService.generateJwtPayload(user);
  }
};
