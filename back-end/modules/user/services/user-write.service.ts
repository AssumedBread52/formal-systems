import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { UserRepository } from '@/user/repositories/user.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { Response } from 'express';

@Injectable()
export class UserWriteService {
  public constructor(private readonly cookieService: CookieService, private readonly tokenService: TokenService, private readonly userRepository: UserRepository) {
  }

  public async editProfile(sessionUser: UserEntity, editUserPayload: EditUserPayload): Promise<UserEntity> {
    try {
      const validatedSessionUser = validatePayload(sessionUser, UserEntity);
      const validatedEditUserPayload = validatePayload(editUserPayload, EditUserPayload);

      if (validatedEditUserPayload.newEmail !== validatedSessionUser.email) {
        const conflict = await this.userRepository.findOneBy({
          email: validatedEditUserPayload.newEmail
        });

        if (conflict) {
          throw new UniqueEmailAddressException();
        }
      }

      validatedSessionUser.firstName = validatedEditUserPayload.newFirstName;
      validatedSessionUser.lastName = validatedEditUserPayload.newLastName;
      validatedSessionUser.email = validatedEditUserPayload.newEmail;
      if (validatedEditUserPayload.newPassword) {
        validatedSessionUser.hashedPassword = hashSync(validatedEditUserPayload.newPassword);
      }

      return this.userRepository.save(validatedSessionUser);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Editting profile failed');
    }
  }

  public async signUp(newUserPayload: NewUserPayload, response: Response): Promise<UserEntity> {
    try {
      const validatedNewUserPayload = validatePayload(newUserPayload, NewUserPayload);

      const conflict = await this.userRepository.findOneBy({
        email: validatedNewUserPayload.email
      });

      if (conflict) {
        throw new UniqueEmailAddressException();
      }

      const user = new UserEntity();

      user.firstName = validatedNewUserPayload.firstName;
      user.lastName = validatedNewUserPayload.lastName;
      user.email = validatedNewUserPayload.email;
      user.hashedPassword = hashSync(validatedNewUserPayload.password);

      const savedUser = await this.userRepository.save(user);

      const token = this.tokenService.generateUserToken(savedUser);

      this.cookieService.setAuthCookies(response, token);

      return savedUser;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Sign up failed');
    }
  }
};
