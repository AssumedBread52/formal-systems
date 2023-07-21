import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';

export const expectBadAuthPayloadResponse = (response: Response): void => {
  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
