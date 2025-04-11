import { UserEntity } from '@/user/entities/user.entity';
import { UserUniqueEmailAddressException } from '@/user/exceptions/user-unique-email-address.exception';
import { Injectable } from '@nestjs/common';
import { UserPort } from './port/user.port';

@Injectable()
export class UserCreateService {
  constructor(private userPort: UserPort) {
  }

  async create(newUserPayload: any): Promise<UserEntity> {
    const conflictUser = await this.userPort.readByEmail(newUserPayload);

    if (conflictUser) {
      throw new UserUniqueEmailAddressException();
    }

    return this.userPort.create(newUserPayload);
  }
};
