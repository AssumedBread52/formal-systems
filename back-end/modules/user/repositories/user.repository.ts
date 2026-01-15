import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { ConflictPayload } from '@/user/payloads/conflict.payload';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { EmailPayload } from '@/user/payloads/email.payload';
import { MongoUserIdPayload } from '@/user/payloads/mongo-user-id.payload';
import { NewCountsPayload } from '@/user/payloads/new-counts.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class UserRepository {
  public constructor(@InjectRepository(MongoUserEntity) private readonly repository: MongoRepository<MongoUserEntity>) {
  }

  public async findOneByEmail(emailPayload: EmailPayload): Promise<UserEntity | null> {
    try {
      const validatedEmailPayload = validatePayload(emailPayload, EmailPayload);

      const mongoUser = await this.repository.findOneBy(validatedEmailPayload);

      if (!mongoUser) {
        return null;
      }

      const user = this.createDomainEntityFromDatabaseEntity(mongoUser);

      return validatePayload(user, UserEntity);
    } catch {
      throw new Error('Finding user failed');
    }
  }

  public async save(user: UserEntity): Promise<UserEntity> {
    try {
      if (!user.id) {
        user.id = (new ObjectId()).toString();
      }

      const validatedUser = validatePayload(user, UserEntity);

      const mongoUser = this.createDatabaseEntityFromDomainEntity(validatedUser);

      const savedMongoUser = await this.repository.save(mongoUser);

      const savedUser = this.createDomainEntityFromDatabaseEntity(savedMongoUser);

      return validatePayload(savedUser, UserEntity);
    } catch {
      throw new Error('Saving user to database failed');
    }
  }

  async readByEmail(emailPayload: any): Promise<UserEntity | null> {
    const { email } = validatePayload(emailPayload, EmailPayload);

    const user = await this.repository.findOneBy({
      email
    });

    if (!user) {
      return null;
    }

    return this.createDomainEntityFromDatabaseEntity(user);
  }

  async readById(userIdPayload: any): Promise<UserEntity | null> {
    const { userId } = validatePayload(userIdPayload, MongoUserIdPayload);

    const user = await this.repository.findOneBy({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return null;
    }

    return this.createDomainEntityFromDatabaseEntity(user);
  }

  readConflictExists(conflictPayload: any): Promise<boolean> {
    const { email } = validatePayload(conflictPayload, ConflictPayload);

    return this.repository.existsBy({
      email
    });
  }

  async update(user: any, editUserPayload: any): Promise<UserEntity> {
    const userEntity = validatePayload(user, UserEntity);
    const { newFirstName, newLastName, newEmail, newPassword } = validatePayload(editUserPayload, EditUserPayload);

    const originalUser = this.createDatabaseEntityFromDomainEntity(userEntity);

    originalUser.firstName = newFirstName;
    originalUser.lastName = newLastName;
    originalUser.email = newEmail;
    if (newPassword) {
      originalUser.hashedPassword = hashSync(newPassword);
    }

    const updatedUser = await this.repository.save(originalUser);

    return this.createDomainEntityFromDatabaseEntity(updatedUser);
  }

  async updateCounts(user: any, newCountsPayload: any): Promise<UserEntity> {
    const userEntity = validatePayload(user, UserEntity);
    const { systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount } = validatePayload(newCountsPayload, NewCountsPayload);

    const originalUser = this.createDatabaseEntityFromDomainEntity(userEntity);

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

    const updatedUser = await this.repository.save(originalUser);

    return this.createDomainEntityFromDatabaseEntity(updatedUser);
  }

  private createDatabaseEntityFromDomainEntity(user: UserEntity): MongoUserEntity {
    const mongoUser = new MongoUserEntity();

    mongoUser._id = new ObjectId(user.id);
    mongoUser.firstName = user.firstName;
    mongoUser.lastName = user.lastName;
    mongoUser.email = user.email;
    mongoUser.hashedPassword = user.hashedPassword;
    mongoUser.systemCount = user.systemCount;
    mongoUser.constantSymbolCount = user.constantSymbolCount;
    mongoUser.variableSymbolCount = user.variableSymbolCount;
    mongoUser.axiomCount = user.axiomCount;
    mongoUser.theoremCount = user.theoremCount;
    mongoUser.deductionCount = user.deductionCount;
    mongoUser.proofCount = user.proofCount;

    return mongoUser;
  }

  private createDomainEntityFromDatabaseEntity(mongoUser: MongoUserEntity): UserEntity {
    const user = new UserEntity();

    user.id = mongoUser._id.toString();
    user.firstName = mongoUser.firstName;
    user.lastName = mongoUser.lastName;
    user.email = mongoUser.email;
    user.hashedPassword = mongoUser.hashedPassword;
    user.systemCount = mongoUser.systemCount;
    user.constantSymbolCount = mongoUser.constantSymbolCount;
    user.variableSymbolCount = mongoUser.variableSymbolCount;
    user.axiomCount = mongoUser.axiomCount;
    user.theoremCount = mongoUser.theoremCount;
    user.deductionCount = mongoUser.deductionCount;
    user.proofCount = mongoUser.proofCount;

    return user;
  }
};
