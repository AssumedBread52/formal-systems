import { JwtAuthGuard } from '@/auth/guards';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from './user-schema';
import { UserService } from './user-service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  getProfile(@Req() req: Request): UserDocument | undefined {
    return req.user;
  }

  @Get(':id')
  async readById(@Param('id') id: string): Promise<UserDocument | null> {
    return this.userService.readById(id);
  }
};
