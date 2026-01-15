import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EmailPayload } from '@/user/payloads/email.payload';
import { UserRepository } from '@/user/repositories/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserCreateService {
  constructor(private userRepository: UserRepository) {
  }

  async create(newUserPayload: any): Promise<UserEntity> {
    const { email } = validatePayload(newUserPayload, EmailPayload);

    const conflictExists = await this.userRepository.readConflictExists({
      email
    });

    if (conflictExists) {
      throw new UniqueEmailAddressException();
    }

    return this.userRepository.create(newUserPayload);
  }
};
