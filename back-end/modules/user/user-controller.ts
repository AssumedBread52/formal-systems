import { SessionUser } from '@/auth/decorators';
import { JwtAuthGuard } from '@/auth/guards';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserDocument } from './user-schema';

@Controller('user')
export class UserController {
  constructor() {
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  getProfile(@SessionUser() sessionUser: UserDocument): UserDocument {
    return sessionUser;
  }
};
