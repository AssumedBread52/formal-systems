import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload, ServerUser } from './data-transfer-objects';
import { SessionUser } from './decorators';
import { LocalGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(LocalGuard)
  @Post('sign-in')
  signIn(@SessionUser() sessionUser: ServerUser): Promise<JwtPayload> {
    return this.authService.signIn(sessionUser);
  }
};
