import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EditEmailPayload } from '@/user/payloads/edit-email.payload';
import { EmailPayload } from '@/user/payloads/email.payload';
import { UserRepository } from '@/user/repositories/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserUpdateService {
  constructor(private userRepository: UserRepository) {
  }

  async update(user: any, editUserPayload: any): Promise<UserEntity> {
    const { email } = validatePayload(user, EmailPayload);
    const { newEmail } = validatePayload(editUserPayload, EditEmailPayload);

    if (email !== newEmail) {
      const conflictExists = await this.userRepository.readConflictExists({
        email: newEmail
      });

      if (conflictExists) {
        throw new UniqueEmailAddressException();
      }
    }

    return this.userRepository.update(user, editUserPayload);
  }
};
