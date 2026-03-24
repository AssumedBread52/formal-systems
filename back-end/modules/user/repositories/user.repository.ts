import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { FindOneByPayload } from '@/user/payloads/find-one-by.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Filter, MongoRepository } from 'typeorm';

@Injectable()
export class UserRepository {
  public constructor(@InjectRepository(MongoUserEntity) private readonly repository: MongoRepository<MongoUserEntity>) {
  }

  public async findOneBy(findOneByPayload: FindOneByPayload): Promise<UserEntity | null> {
    try {
      const validatedFindOneByPayload = validatePayload(findOneByPayload, FindOneByPayload);

      const filters = {} as Filter<MongoUserEntity>;
      if (validatedFindOneByPayload.id) {
        filters._id = new ObjectId(validatedFindOneByPayload.id);
      }
      if (validatedFindOneByPayload.email) {
        filters.email = validatedFindOneByPayload.email;
      }

      const mongoUser = await this.repository.findOneBy(filters);

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

  private createDatabaseEntityFromDomainEntity(user: UserEntity): MongoUserEntity {
    const mongoUser = new MongoUserEntity();

    mongoUser._id = new ObjectId(user.id);
    mongoUser.firstName = user.firstName;
    mongoUser.lastName = user.lastName;
    mongoUser.email = user.email;
    mongoUser.passwordHash = user.passwordHash;
    mongoUser.systemCount = user.systemCount;
    mongoUser.constantSymbolCount = user.constantSymbolCount;
    mongoUser.variableSymbolCount = user.variableSymbolCount;
    mongoUser.distinctVariablePairCount = user.distinctVariablePairCount;
    mongoUser.constantVariablePairExpressionCount = user.constantVariablePairExpressionCount;
    mongoUser.constantPrefixedExpressionCount = user.constantPrefixedExpressionCount;
    mongoUser.standardExpressionCount = user.standardExpressionCount;

    return mongoUser;
  }

  private createDomainEntityFromDatabaseEntity(mongoUser: MongoUserEntity): UserEntity {
    const user = new UserEntity();

    user.id = mongoUser._id.toString();
    user.firstName = mongoUser.firstName;
    user.lastName = mongoUser.lastName;
    user.email = mongoUser.email;
    user.passwordHash = mongoUser.passwordHash;
    user.systemCount = mongoUser.systemCount;
    user.constantSymbolCount = mongoUser.constantSymbolCount;
    user.variableSymbolCount = mongoUser.variableSymbolCount;
    user.distinctVariablePairCount = mongoUser.distinctVariablePairCount;
    user.constantVariablePairExpressionCount = mongoUser.constantVariablePairExpressionCount;
    user.constantPrefixedExpressionCount = mongoUser.constantPrefixedExpressionCount;
    user.standardExpressionCount = mongoUser.standardExpressionCount;

    return user;
  }
};
