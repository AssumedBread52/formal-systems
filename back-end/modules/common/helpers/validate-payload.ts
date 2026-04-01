import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const validatePayload = <Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload => {
  try {
    const isInstance = payload instanceof payloadConstructor;

    if (!isInstance) {
      payload = plainToInstance(payloadConstructor, payload, {
        ignoreDecorators: true
      });
    }

    const errors = validateSync(payload, {
      forbidNonWhitelisted: !isInstance,
      whitelist: !isInstance
    });

    if (0 < errors.length) {
      throw new Error('Payload validation errors detected');
    }

    return payload;
  } catch {
    throw new Error('Payload validation failed');
  }
};
