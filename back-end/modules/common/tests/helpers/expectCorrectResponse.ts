import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';

export const expectCorrectResponse = (response: Response, status: HttpStatus, payload: any): void => {
  const { statusCode, body } = response;

  expect(statusCode).toBe(status);
  expect(body).toEqual(payload);
};
