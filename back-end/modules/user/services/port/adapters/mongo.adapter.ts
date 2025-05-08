import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { AdapterType } from '@/user/enums/adapter-type.enum';
import { ConflictPayload } from '@/user/payloads/conflict.payload';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { EmailPayload } from '@/user/payloads/email.payload';
import { MongoUserIdPayload } from '@/user/payloads/mongo-user-id.payload';
import { NewCountsPayload } from '@/user/payloads/new-counts.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { UserAdapter } from './user.adapter';

@Injectable()
export class MongoAdapter extends UserAdapter {
  constructor(@InjectRepository(MongoUserEntity) private mongoRepository: MongoRepository<MongoUserEntity>) {
    super();
  }

  override async create(newUserPayload: any): Promise<UserEntity> {
    const { firstName, lastName, email, password } = validatePayload(newUserPayload, NewUserPayload);

    const user = new MongoUserEntity();

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync(password, 12);

    const newUser = await this.mongoRepository.save(user);

    return this.convertToDomainEntity(newUser);
  }

  override async readByEmail(emailPayload: any): Promise<UserEntity | null> {
    const { email } = validatePayload(emailPayload, EmailPayload);

    const user = await this.mongoRepository.findOneBy({
      email
    });

    if (!user) {
      return user;
    }

    return this.convertToDomainEntity(user);
  }

  override async readById(userIdPayload: any): Promise<UserEntity | null> {
    const { userId } = validatePayload(userIdPayload, MongoUserIdPayload);

    const user = await this.mongoRepository.findOneBy({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return user;
    }

    return this.convertToDomainEntity(user);
  }

  override readConflictExists(conflictPayload: any): Promise<boolean> {
    const { email } = validatePayload(conflictPayload, ConflictPayload);

    return this.mongoRepository.existsBy({
      email
    });
  }

  override async update(user: any, editUserPayload: any): Promise<UserEntity> {
    const userEntity = validatePayload(user, UserEntity);
    const { newFirstName, newLastName, newEmail, newPassword } = validatePayload(editUserPayload, EditUserPayload);

    const originalUser = this.convertFromDomainEntity(userEntity);

    originalUser.firstName = newFirstName;
    originalUser.lastName = newLastName;
    originalUser.email = newEmail;
    if (newPassword) {
      originalUser.hashedPassword = hashSync(newPassword, 12);
    }

    const updatedUser = await this.mongoRepository.save(originalUser);

    return this.convertToDomainEntity(updatedUser);
  }

  override async updateCounts(user: any, newCountsPayload: any): Promise<UserEntity> {
    const userEntity = validatePayload(user, UserEntity);
    const { systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount } = validatePayload(newCountsPayload, NewCountsPayload);

    const originalUser = this.convertFromDomainEntity(userEntity);

    if (typeof systemCount !== 'undefined') {
      originalUser.systemCount = systemCount;
    }
    if (typeof constantSymbolCount !== 'undefined') {
      originalUser.constantSymbolCount = constantSymbolCount;
    }
    if (typeof variableSymbolCount !== 'undefined') {
      originalUser.variableSymbolCount = variableSymbolCount;
    }
    if (typeof axiomCount !== 'undefined') {
      originalUser.axiomCount = axiomCount;
    }
    if (typeof theoremCount !== 'undefined') {
      originalUser.theoremCount = theoremCount;
    }
    if (typeof deductionCount !== 'undefined') {
      originalUser.deductionCount = deductionCount;
    }
    if (typeof proofCount !== 'undefined') {
      originalUser.proofCount = proofCount;
    }

    const updatedUser = await this.mongoRepository.save(originalUser);

    return this.convertToDomainEntity(updatedUser);
  }

  private convertFromDomainEntity(user: UserEntity): MongoUserEntity {
    const { id, firstName, lastName, email, hashedPassword, systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount } = user;

    const mongoUser = new MongoUserEntity();

    mongoUser._id = new ObjectId(id);
    mongoUser.firstName = firstName;
    mongoUser.lastName = lastName;
    mongoUser.email = email;
    mongoUser.hashedPassword = hashedPassword;
    mongoUser.systemCount = systemCount;
    mongoUser.constantSymbolCount = constantSymbolCount;
    mongoUser.variableSymbolCount = variableSymbolCount;
    mongoUser.axiomCount = axiomCount;
    mongoUser.theoremCount = theoremCount;
    mongoUser.deductionCount = deductionCount;
    mongoUser.proofCount = proofCount;

    return mongoUser;
  }

  private convertToDomainEntity(mongoUser: MongoUserEntity): UserEntity {
    const { _id, firstName, lastName, email, hashedPassword, systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount } = mongoUser;

    const user = new UserEntity();

    user.type = AdapterType.Mongo;
    user.id = _id.toString();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.axiomCount = axiomCount;
    user.theoremCount = theoremCount;
    user.deductionCount = deductionCount;
    user.proofCount = proofCount;

    return user;
  }
};
