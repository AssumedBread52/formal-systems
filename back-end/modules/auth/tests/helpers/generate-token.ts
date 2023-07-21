import { AuthService } from '@/auth/auth.service';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

export const generateToken = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService);

  const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

  expect(userRepositoryMock.users.length).toBeGreaterThan(0);

  const { _id } = userRepositoryMock.users[0];

  return authService.generateToken(_id);
};
