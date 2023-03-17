import { SessionUser } from '@/auth/decorators';
import { JwtAuthGuard } from '@/auth/guards';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserDocument } from './user-schema';
import { UserService } from './user-service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  getProfile(@SessionUser() sessionUser: UserDocument): UserDocument {
    return sessionUser;
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserDocument | null> {
    return this.userService.readById(id);
  }
};
