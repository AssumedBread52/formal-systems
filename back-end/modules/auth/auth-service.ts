import { UserDocument } from '@/user/user-schema';
import { UserService } from '@/user/user-service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {
  }

  async validateUserCredentials(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userService.readByEmail(email);

    if (!user) {
      return null;
    }

    const { hashedPassword } = user;

    const matched = await compare(password, hashedPassword);

    if (!matched) {
      return null;
    }

    return user;
  }

  async validateUserId(id: string): Promise<UserDocument | null> {
    return this.userService.readById(id);
  }

  login(user: UserDocument): string {
    const { _id } = user;

    return this.jwtService.sign({ _id });
  }
};
