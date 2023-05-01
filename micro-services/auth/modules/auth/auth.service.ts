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

  async signIn(email: string, password: string): Promise<JwtPayload> {
    const user = await lastValueFrom(this.client.send<ServerUser, string>('READ_USER_BY_EMAIL', email).pipe(timeout(3000)));

    const { _id, hashedPassword } = user;

    const matched = await compare(password, hashedPassword);

    if (!matched) {
      throw new UnauthorizedException();
    }

    const token = await this.jwtService.signAsync({
      id: _id
    });

    return { token };
  }
};
