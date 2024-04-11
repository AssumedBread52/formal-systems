import { SignUpPayload } from '@/auth/payloads/sign-up.payload';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { EditProfilePayload } from './payloads/edit-profile.payload';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
  }

  private async conflictCheck(email: string): Promise<void> {
    const collision = await this.userRepository.findOneBy({
      email
    });

    if (collision) {
      throw new ConflictException('Users must have a unique e-mail address.');
    }
  }

  async create(signUpPayload: SignUpPayload): Promise<UserEntity> {
    const { firstName, lastName, email, password } = signUpPayload;

    await this.conflictCheck(email);

    const user = new UserEntity();

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = await hash(password, 12);

    return this.userRepository.save(user);
  }

  readByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({
      email
    });
  }

  readById(userId: ObjectId): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({
      _id: userId
    });
  }

  async update(sessionUser: UserEntity, editProfilePayload: EditProfilePayload): Promise<UserEntity> {
    const { email } = sessionUser;
    const { newFirstName, newLastName, newEmail, newPassword } = editProfilePayload;

    if (email !== newEmail) {
      await this.conflictCheck(newEmail);
    }

    sessionUser.firstName = newFirstName;
    sessionUser.lastName = newLastName;
    sessionUser.email = newEmail;
    if (newPassword) {
      sessionUser.hashedPassword = await hash(newPassword, 12);
    }

    return this.userRepository.save(sessionUser);
  }
};
