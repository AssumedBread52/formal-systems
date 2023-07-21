import { AuthService } from '@/auth/auth.service';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

export const testWithExpiredToken = async (app: INestApplication, url: string): Promise<void> => {
  const authService = app.get(AuthService);

  const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

  expect(userRepositoryMock.users.length).toBeGreaterThan(0);

  const { _id } = userRepositoryMock.users[0];

  const token = await authService.generateToken(_id);

  await new Promise((resolve: (value: unknown) => void): NodeJS.Timeout => {
    return setTimeout(resolve, 2000);
  });

  const response = await request(app.getHttpServer()).post(url).set('Cookie', [
    `token=${token}`
  ]);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
