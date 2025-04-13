import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EditEmailPayload } from '@/user/payloads/edit-email.payload';
import { EmailPayload } from '@/user/payloads/email.payload';
import { Injectable } from '@nestjs/common';
import { UserPort } from './port/user.port';

@Injectable()
export class UserUpdateService {
  constructor(private userPort: UserPort) {
  }

  async update(user: any, editUserPayload: any): Promise<UserEntity> {
    const { email } = validatePayload(user, EmailPayload);
    const { newEmail } = validatePayload(editUserPayload, EditEmailPayload);

    if (email !== newEmail) {
      const conflictUser = await this.userPort.readByEmail({
        email: newEmail
      });

      if (conflictUser) {
        throw new UniqueEmailAddressException();
      }
    }

    return this.userPort.update(user, editUserPayload);
  }
};
