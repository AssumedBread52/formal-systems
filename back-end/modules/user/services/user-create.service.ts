import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { Injectable } from '@nestjs/common';
import { UserPort } from './port/user.port';

@Injectable()
export class UserCreateService {
  constructor(private userPort: UserPort) {
  }

  async create(newUserPayload: any): Promise<UserEntity> {
    const conflictUser = await this.userPort.readByEmail(newUserPayload);

    if (conflictUser) {
      throw new UniqueEmailAddressException();
    }

    return this.userPort.create(newUserPayload);
  }
};
