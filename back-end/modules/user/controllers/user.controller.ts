import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { UserEntity } from '@/user/entities/user.entity';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { UserReadService } from '@/user/services/user-read.service';
import { UserWriteService } from '@/user/services/user-write.service';
import { Body, ClassSerializerInterceptor, Controller, Get, Param, Patch, Post, Res, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';

@Controller('user')
export class UserController {
  public constructor(private readonly userReadService: UserReadService, private readonly userWriteService: UserWriteService) {
  }

  @Get('session-user')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getSessionUser(@SessionUser() sessionUser: UserEntity): UserEntity {
    return sessionUser;
  }

  @Get(':userId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('userId') userId: string): Promise<UserEntity> {
    return this.userReadService.selectById(userId);
  }

  @Patch('session-user')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public patchSessionUser(@SessionUser() sessionUser: UserEntity, @Body(new ValidationPipe({ transform: true })) editUserPayload: EditUserPayload): Promise<UserEntity> {
    return this.userWriteService.editProfile(sessionUser, editUserPayload);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  public postUser(@Body(new ValidationPipe({ transform: true })) payload: NewUserPayload, @Res({ passthrough: true }) response: Response): Promise<UserEntity> {
    return this.userWriteService.signUp(payload, response);
  }
};
