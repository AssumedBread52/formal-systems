import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { compare } from 'bcryptjs';
import { lastValueFrom, timeout } from 'rxjs';
import { JwtPayload, ServerUser } from './data-transfer-objects';

@Injectable()
export class AuthService {
  constructor(@Inject('MESSAGING_SERVICE') private client: ClientProxy, private jwtService: JwtService) {
  }

  async validateUserByCredentials(email: string, password: string): Promise<ServerUser> {
    const user = await lastValueFrom(this.client.send<ServerUser, string>('READ_USER_BY_EMAIL', email).pipe(timeout(3000)));

    const { hashedPassword } = user;

    const matched = await compare(password, hashedPassword);

    if (!matched) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async signIn(user: ServerUser): Promise<JwtPayload> {
    const { _id } = user;

    const token = await this.jwtService.signAsync({
      id: _id
    });

    return {
      token
    };
  }
};
