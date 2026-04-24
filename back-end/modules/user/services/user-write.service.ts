import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { UniqueEmailAddressException } from '@/user/exceptions/unique-email-address.exception';
import { UniqueHandleException } from '@/user/exceptions/unique-handle.exception';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { Response } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class UserWriteService {
  public constructor(private readonly cookieService: CookieService, private readonly tokenService: TokenService, @InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
  }

  public async editProfile(user: UserEntity, editUserPayload: EditUserPayload): Promise<UserEntity> {
    try {
      const validatedUser = validatePayload(user, UserEntity);
      const validatedEditUserPayload = validatePayload(editUserPayload, EditUserPayload);

      if (validatedEditUserPayload.newHandle !== validatedUser.handle) {
        const handleConflict = await this.repository.existsBy({
          handle: validatedEditUserPayload.newHandle
        });

        if (handleConflict) {
          throw new UniqueHandleException();
        }
      }

      if (validatedEditUserPayload.newEmail !== validatedUser.email) {
        const emailConflict = await this.repository.existsBy({
          email: validatedEditUserPayload.newEmail
        });

        if (emailConflict) {
          throw new UniqueEmailAddressException();
        }
      }

      validatedUser.handle = validatedEditUserPayload.newHandle;
      validatedUser.email = validatedEditUserPayload.newEmail;
      if (validatedEditUserPayload.newPassword) {
        validatedUser.passwordHash = hashSync(validatedEditUserPayload.newPassword);
      }

      return await this.repository.save(validatedUser);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Editing profile failed');
    }
  }

  public async signUp(newUserPayload: NewUserPayload, response: Response): Promise<UserEntity> {
    try {
      const validatedNewUserPayload = validatePayload(newUserPayload, NewUserPayload);

      const handleConflict = await this.repository.existsBy({
        handle: validatedNewUserPayload.handle
      });

      if (handleConflict) {
        throw new UniqueHandleException();
      }

      const emailConflict = await this.repository.existsBy({
        email: validatedNewUserPayload.email
      });

      if (emailConflict) {
        throw new UniqueEmailAddressException();
      }

      const user = new UserEntity();

      user.handle = validatedNewUserPayload.handle;
      user.email = validatedNewUserPayload.email;
      user.passwordHash = hashSync(validatedNewUserPayload.password);

      const savedUser = await this.repository.save(user);

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
