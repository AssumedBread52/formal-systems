import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { compare, hash } from 'bcryptjs';
import { lastValueFrom, timeout } from 'rxjs';
import { CreateUserPayload, JwtPayload, ServerUser, SignUpPayload } from './data-transfer-objects';

@Injectable()
export class AuthService {
  constructor(@Inject('MESSAGING_SERVICE') private client: ClientProxy, private jwtService: JwtService) {
  }

  async createUser(signUpPayload: SignUpPayload): Promise<ServerUser> {
    const { firstName, lastName, email, password } = signUpPayload;

    const hashedPassword = await hash(password, 12);

    return lastValueFrom(this.client.send<ServerUser, CreateUserPayload>('CREATE_USER', {
      firstName,
      lastName,
      email,
      hashedPassword
    }).pipe(timeout(3000)));
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

  validateUserById(id: string): Promise<ServerUser> {
    return lastValueFrom(this.client.send<ServerUser, string>('READ_USER_BY_ID', id).pipe(timeout(3000)));
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
