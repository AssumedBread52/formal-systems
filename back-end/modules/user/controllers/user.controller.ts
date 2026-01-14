import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { UserEntity } from '@/user/entities/user.entity';
import { UserCreateService } from '@/user/services/user-create.service';
import { UserReadService } from '@/user/services/user-read.service';
import { UserUpdateService } from '@/user/services/user-update.service';
import { Body, ClassSerializerInterceptor, Controller, Get, Param, Patch, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private cookieService: CookieService, private tokenService: TokenService, private userCreateService: UserCreateService, private userReadService: UserReadService, private userUpdateService: UserUpdateService) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Get('session-user')
  getSessionUser(@SessionUserDecorator() sessionUser: UserEntity): UserEntity {
    return sessionUser;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':userId')
  getById(@Param('userId') userId: string): Promise<UserEntity> {
    return this.userReadService.readById(userId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Patch('session-user')
  patchSessionUser(@SessionUserDecorator() sessionUser: UserEntity, @Body() payload: any): Promise<UserEntity> {
    return this.userUpdateService.update(sessionUser, payload);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async postUser(@Body() payload: any, @Res({ passthrough: true }) response: Response): Promise<UserEntity> {
    const createdUser = await this.userCreateService.create(payload);

    const { id } = createdUser;

    const token = this.tokenService.generateToken(id);

    this.cookieService.setAuthCookies(response, token);

    return createdUser;
  }
};
