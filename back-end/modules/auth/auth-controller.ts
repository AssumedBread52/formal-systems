import { Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth-service';
import { LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request): { accessToken: string; } {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: this.authService.login(req.user)
    };
  }
};
