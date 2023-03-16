import { UserDocument } from '@/user/user-schema';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth-service';
import { SessionUser } from './decorators';
import { LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@SessionUser() sessionUser: UserDocument): { accessToken: string; } {
    return {
      accessToken: this.authService.login(sessionUser)
    };
  }
};
