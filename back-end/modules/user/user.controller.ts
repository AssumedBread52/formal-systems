import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { Body, Controller, Get, Patch, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { EditProfilePayload } from './payloads/edit-profile.payload';
import { UserPayload } from './payloads/user.payload';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @UseGuards(JwtGuard)
  @Get('session-user')
  getSessionUser(@SessionUserDecorator() sessionUser: UserEntity): UserPayload {
    return new UserPayload(sessionUser);
  }

  @Get(':userId')
  async getById(@ObjectIdDecorator('userId') userId: ObjectId): Promise<UserPayload> {
    const user = await this.userService.readById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return new UserPayload(user);
  }

  @UseGuards(JwtGuard)
  @Patch('session-user')
  async patchSessionUser(@SessionUserDecorator() sessionUser: UserEntity, @Body(ValidationPipe) editProfilePayload: EditProfilePayload): Promise<IdPayload> {
    const { _id } = await this.userService.update(sessionUser, editProfilePayload);

    return new IdPayload(_id);
  }
};
