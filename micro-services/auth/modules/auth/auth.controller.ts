import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload, ServerUser } from './data-transfer-objects';
import { SessionUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('sign-in')
  signIn(@SessionUser() sessionUser: ServerUser): Promise<JwtPayload> {
    return this.authService.signIn(sessionUser);
  }
};
