import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { MongoRepository } from 'typeorm';
import { UserUniqueEmailAddressException } from './exceptions/user-unique-email-address.exception';
import { SignUpPayload } from './payloads/sign-up.payload';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
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

  private async conflictCheck(email: string): Promise<void> {
    const collision = await this.userRepository.findOneBy({
      email
    });

    if (collision) {
      throw new UserUniqueEmailAddressException();
    }
  }
};
