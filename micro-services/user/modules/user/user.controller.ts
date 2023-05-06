import { Body, ConflictException, Controller, Get, NotFoundException, Param, Patch, UseGuards, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientUser, EditProfilePayload, IdPayload } from './data-transfer-objects';
import { SessionUser } from './decorators';
import { JwtGuard } from './guards';
import { User, UserDocument } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @UseGuards(JwtGuard)
  @Get('session-user')
  getSessionUser(@SessionUser() sessionUser: UserDocument): ClientUser {
    return new ClientUser(sessionUser);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ClientUser> {
    const user = await this.userService.readById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return new ClientUser(user);
  }

  @UseGuards(JwtGuard)
  @Patch('session-user')
  async patchSessionUser(@SessionUser() sessionUser: UserDocument, @Body(new ValidationPipe()) editProfilePayload: EditProfilePayload): Promise<IdPayload> {
    const { email } = sessionUser;
    const { newEmail } = editProfilePayload;

    if (email !== newEmail) {
      const collision = await this.userService.readByEmail(newEmail);

      if (collision) {
        throw new ConflictException();
      }
    }

    const { _id } = await this.userService.update(sessionUser, editProfilePayload);

    return {
      id: _id.toString()
    };
  }

  @MessagePattern('CREATE_USER')
  async remoteCreateUser(@Payload() user: User): Promise<UserDocument> {
    const { email } = user;

    const collision = await this.userService.readByEmail(email);

    if (collision) {
      throw new ConflictException();
    }

    return this.userService.create(user);
  }

  @MessagePattern('READ_USER_BY_EMAIL')
  async remoteReadUserByEmail(@Payload() email: string): Promise<UserDocument> {
    const user = await this.userService.readByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @MessagePattern('READ_USER_BY_ID')
  async remoteReadUserById(@Payload() id: string): Promise<UserDocument> {
    const user = await this.userService.readById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
};
