import { BaseValidateService } from '@/common/services/base-validate.service';
import { UserEntity } from '@/user/entities/user.entity';
import { UserUniqueEmailAddressException } from '@/user/exceptions/user-unique-email-address.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
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
