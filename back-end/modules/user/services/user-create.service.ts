import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EmailPayload } from '@/user/payloads/email.payload';
import { Injectable } from '@nestjs/common';
import { UserPort } from './port/user.port';

@Injectable()
export class UserCreateService {
  constructor(private userPort: UserPort) {
  }

  async create(newUserPayload: any): Promise<UserEntity> {
    const { email } = validatePayload(newUserPayload, EmailPayload);

    const conflictExists = await this.userPort.readConflictExists({
      email
    });

    if (conflictExists) {
      throw new UniqueEmailAddressException();
    }

    return this.userPort.create(newUserPayload);
  }
};
