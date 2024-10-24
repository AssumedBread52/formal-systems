import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isMongoId, validateSync } from 'class-validator';
import { ObjectId } from 'mongodb';

@Injectable()
export abstract class BaseValidateService {
  abstract conflictCheck(...params: any[]): Promise<void>;

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
