import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private userService: UserService) {
  }

  async validateUserByCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.userService.readByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid e-mail address or password.');
    }

    const { hashedPassword } = user;

    const matched = await compare(password, hashedPassword);

    if (!matched) {
      throw new UnauthorizedException('Invalid e-mail address or password.');
    }

    return user;
  }

  async validateUserById(id: string): Promise<UserEntity> {
    const user = await this.userService.readById(id);

    if (!user) {
      throw new UnauthorizedException('Invalid token.');
    }

    return user;
  }

  generateToken(user: UserEntity): Promise<string> {
    const { _id } = user;

    return this.jwtService.signAsync({
      id: _id.toString()
    });
  }
};
