import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { Body, Controller, Get, NotFoundException, Patch, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'typeorm';
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

  @Get(':id')
  async getById(@ObjectIdDecorator('id') id: ObjectId): Promise<UserPayload> {
    const user = await this.userService.readById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
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
