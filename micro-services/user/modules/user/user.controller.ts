import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UserDocument } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserDocument> {
    const user = await this.userService.readById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
};
