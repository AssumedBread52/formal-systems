import { ValidationPipe } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const validatePayload = <Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload => {
  const newPayload = plainToInstance(payloadConstructor, payload, {
    ignoreDecorators: true
  });

  const errors = validateSync(newPayload);

  if (0 < errors.length) {
    const validationPipe = new ValidationPipe();

    throw validationPipe.createExceptionFactory()(errors);
  }

  return newPayload;
};
