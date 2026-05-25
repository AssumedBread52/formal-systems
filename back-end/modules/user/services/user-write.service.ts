import { CookieService } from '@/auth/services/cookie.service';
import { TokenService } from '@/auth/services/token.service';
import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { UserReadService } from './user-read.service';

@Injectable()
export class UserWriteService {
  public constructor(private readonly cookieService: CookieService, private readonly tokenService: TokenService, private readonly userReadService: UserReadService, @InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
  }

  public async editProfile(user: UserEntity, editUserPayload: EditUserPayload): Promise<UserEntity> {
    try {
      const validatedUser = validatePayload(user, UserEntity);
      const validatedEditUserPayload = validatePayload(editUserPayload, EditUserPayload);

      if (validatedEditUserPayload.handle !== undefined && validatedEditUserPayload.handle !== validatedUser.handle) {
        await this.userReadService.verifyUniqueHandle(validatedEditUserPayload.handle);

        validatedUser.handle = validatedEditUserPayload.handle;
      }

      if (validatedEditUserPayload.email !== undefined && validatedEditUserPayload.email !== validatedUser.email) {
        await this.userReadService.verifyUniqueEmail(validatedEditUserPayload.email);

        validatedUser.email = validatedEditUserPayload.email;
      }

      if (validatedEditUserPayload.password !== undefined) {
        validatedUser.passwordHash = hashSync(validatedEditUserPayload.password);
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

      await this.userReadService.verifyUniqueHandle(validatedNewUserPayload.handle);

      await this.userReadService.verifyUniqueEmail(validatedNewUserPayload.email);

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
