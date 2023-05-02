import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload, SignInPayload } from './data-transfer-objects';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('sign-in')
  signIn(@Body(new ValidationPipe()) signInPayload: SignInPayload): Promise<JwtPayload> {
    const { email, password } = signInPayload;

    return this.authService.signIn(email, password);
  }
};
