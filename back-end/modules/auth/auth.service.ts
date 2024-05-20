import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private userService: UserService) {
  }

  async validateUserByCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.userService.readByEmail(email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const { hashedPassword } = user;

    const matched = await compare(password, hashedPassword);

    if (!matched) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  async validateUserById(userId: ObjectId): Promise<UserEntity> {
    const user = await this.userService.readById(userId);

    if (!user) {
      throw new InvalidTokenException();
    }

    return user;
  }

  generateToken(userId: ObjectId): Promise<string> {
    return this.jwtService.signAsync({
      id: userId
    });
  }
};
