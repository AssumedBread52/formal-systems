import { SignUpPayload } from '@/auth/data-transfer-objects/sign-up.payload';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { EditProfilePayload } from './data-transfer-objects/edit-profile.payload';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
  }

  private async checkForConflict(email: string): Promise<void> {
    const collision = await this.userRepository.findOneBy({
      email
    });

    if (collision) {
      throw new ConflictException('Users must have a unique e-mail address.');
    }
  }

  async create(user: SignUpPayload): Promise<UserEntity> {
    const { firstName, lastName, email, password } = user;

    await this.checkForConflict(email);

    const hashedPassword = await hash(password, 12);

    return this.userRepository.save({
      firstName,
      lastName,
      email,
      hashedPassword,
      systemCount: 0,
      constantSymbolCount: 0,
      variableSymbolCount: 0
    });
  }

  readByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({
      email
    });
  }

  readById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({
      _id: new ObjectId(id)
    });
  }

  async update(sessionUser: UserEntity, editProfilePayload: EditProfilePayload): Promise<void> {
    const { email } = sessionUser;
    const { newFirstName, newLastName, newEmail, newPassword } = editProfilePayload;

    if (email !== newEmail) {
      await this.checkForConflict(newEmail);
    }

    sessionUser.firstName = newFirstName;
    sessionUser.lastName = newLastName;
    sessionUser.email = newEmail;
    if (newPassword) {
      sessionUser.hashedPassword = await hash(newPassword, 12);
    }

    await this.userRepository.save(sessionUser);
  }
};
