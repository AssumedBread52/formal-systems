import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientUser } from './data-transfer-objects';
import { SessionUser } from './decorators';
import { JwtGuard } from './guards';
import { UserDocument } from './user.schema';
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

  @MessagePattern('READ_USER_BY_EMAIL')
  async getByEmail(@Payload() email: string): Promise<UserDocument> {
    const user = await this.userService.readByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
};
