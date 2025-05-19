import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EmailPayload } from '@/user/payloads/email.payload';
import { CompositeAdapterRepository } from '@/user/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserCreateService {
  constructor(private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async create(newUserPayload: any): Promise<UserEntity> {
    const { email } = validatePayload(newUserPayload, EmailPayload);

    const conflictExists = await this.compositeAdapterRepository.readConflictExists({
      email
    });

    if (conflictExists) {
      throw new UniqueEmailAddressException();
    }

    return this.compositeAdapterRepository.create(newUserPayload);
  }
};
