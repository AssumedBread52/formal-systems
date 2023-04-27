import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(): {
    token: string;
  } {
    return {
      token: 'Generated token!'
    };
  }
};
