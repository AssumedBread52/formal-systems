import { Injectable, ValidationPipe } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class PayloadValidationService {
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
