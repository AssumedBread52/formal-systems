import { BaseValidationService } from '@/common/services/base-validation.service';
import { UserUniqueEmailAddressException } from '@/user/exceptions/user-unique-email-address.exception';
import { UserEntity } from '@/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidationService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
    super();
  }

  async conflictCheck(email: string): Promise<void> {
    const collision = await this.userRepository.findOneBy({
      email
    });

    if (collision) {
      throw new UserUniqueEmailAddressException();
    }
  }
};
