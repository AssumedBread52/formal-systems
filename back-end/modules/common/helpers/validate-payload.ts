import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const validatePayload = <Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload => {
  try {
    const newPayload = plainToInstance(payloadConstructor, payload, {
      ignoreDecorators: true
    });

    const errors = validateSync(newPayload, {
      forbidNonWhitelisted: true,
      whitelist: true
    });

    if (0 < errors.length) {
      throw new Error('Payload validation errors detected');
    }

    return newPayload;
  } catch {
    throw new Error('Payload validation failed');
  }
};
