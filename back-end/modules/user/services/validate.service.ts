import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
import { UserUniqueEmailAddressException } from '@/user/exceptions/user-unique-email-address.exception';
import { UserEntity } from '@/user/user.entity';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isMongoId, validateSync } from 'class-validator';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
  }

  async conflictCheck(email: string): Promise<void> {
    const collision = await this.userRepository.findOneBy({
      email
    });

    if (collision) {
      throw new UserUniqueEmailAddressException();
    }
  }

  idCheck(id: any): ObjectId {
    if (!isMongoId(id)) {
      throw new InvalidObjectIdException();
    }

    return new ObjectId(id);
  }

  payloadCheck<Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload {
    const newPayload = plainToClass(payloadConstructor, payload);

    const errors = validateSync(newPayload);

    if (0 < errors.length) {
      const validationPipe = new ValidationPipe();

      throw validationPipe.createExceptionFactory()(errors);
    }

    return newPayload;
  }
};
