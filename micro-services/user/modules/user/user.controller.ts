import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ClientUser } from './data-transfer-objects';
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
};
