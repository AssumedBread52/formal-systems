import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientUser } from './data-transfer-objects';
import { UserDocument } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
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
