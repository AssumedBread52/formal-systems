import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EditEmailPayload } from '@/user/payloads/edit-email.payload';
import { EmailPayload } from '@/user/payloads/email.payload';
import { CompositeAdapterRepository } from '@/user/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserUpdateService {
  constructor(private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async update(user: any, editUserPayload: any): Promise<UserEntity> {
    const { email } = validatePayload(user, EmailPayload);
    const { newEmail } = validatePayload(editUserPayload, EditEmailPayload);

    if (email !== newEmail) {
      const conflictExists = await this.compositeAdapterRepository.readConflictExists({
        email: newEmail
      });

      if (conflictExists) {
        throw new UniqueEmailAddressException();
      }
    }

    return this.compositeAdapterRepository.update(user, editUserPayload);
  }
};
