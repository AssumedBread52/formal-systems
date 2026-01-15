import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { UserEntity } from '@/user/entities/user.entity';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { UserReadService } from '@/user/services/user-read.service';
import { UserUpdateService } from '@/user/services/user-update.service';
import { UserService } from '@/user/services/user.service';
import { Body, ClassSerializerInterceptor, Controller, Get, Param, Patch, Post, Res, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';

@Controller('user')
export class UserController {
  public constructor(private readonly userService: UserService, private userReadService: UserReadService, private userUpdateService: UserUpdateService) {
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
  public postUser(@Body(new ValidationPipe({ transform: true })) payload: NewUserPayload, @Res({ passthrough: true }) response: Response): Promise<UserEntity> {
    return this.userService.signUp(payload, response);
  }
};
