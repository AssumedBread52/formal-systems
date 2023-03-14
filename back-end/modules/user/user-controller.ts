import { Controller, Get, Param } from '@nestjs/common';
import { UserDocument } from './user-schema';
import { UserService } from './user-service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get(':id')
  async readById(@Param('id') id: string): Promise<UserDocument | null> {
    return this.userService.readById(id);
  }
};
