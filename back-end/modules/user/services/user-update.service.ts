import { UserEntity } from '@/user/entities/user.entity';
import { EditProfilePayload } from '@/user/payloads/edit-profile.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class UserUpdateService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>, private validateService: ValidateService) {
  }

  async update(user: UserEntity, payload: any): Promise<UserEntity> {
    const editProfilePayload = this.validateService.payloadCheck(payload, EditProfilePayload);

    const { email } = user;
    const { newFirstName, newLastName, newEmail, newPassword } = editProfilePayload;

    if (email !== newEmail) {
      await this.validateService.conflictCheck(newEmail);
    }

    user.firstName = newFirstName;
    user.lastName = newLastName;
    user.email = newEmail;
    if (newPassword) {
      user.hashedPassword = hashSync(newPassword, 12);
    }

    return this.userRepository.save(user);
  }
};
