import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { Body, Controller, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UserPayload } from './payloads/user.payload';
import { UserCreateService } from './services/user-create.service';
import { UserReadService } from './services/user-read.service';
import { UserUpdateService } from './services/user-update.service';
import { UserEntity } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private cookieService: CookieService, private tokenService: TokenService, private userCreateService: UserCreateService, private userReadService: UserReadService, private userUpdateService: UserUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Get('session-user')
  getSessionUser(@SessionUserDecorator() sessionUser: UserEntity): UserPayload {
    return new UserPayload(sessionUser);
  }

  @Get(':userId')
  async getById(@Param('userId') userId: string): Promise<UserPayload> {
    const user = await this.userReadService.readById(userId);

    return new UserPayload(user);
  }

  @UseGuards(JwtGuard)
  @Patch('session-user')
  async patchSessionUser(@SessionUserDecorator() sessionUser: UserEntity, @Body() payload: any): Promise<UserPayload> {
    const updatedSessionUser = await this.userUpdateService.update(sessionUser, payload);

    return new UserPayload(updatedSessionUser);
  }

  @Post()
  async postUser(@Body() payload: any, @Res({ passthrough: true }) response: Response): Promise<UserPayload> {
    const createdUser = await this.userCreateService.create(payload);

    const { _id } = createdUser;

    const token = this.tokenService.generateToken(_id);

    this.cookieService.setAuthCookies(response, token);

    return new UserPayload(createdUser);
  }
};
