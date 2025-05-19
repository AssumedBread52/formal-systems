import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { AdapterType } from '@/user/enums/adapter-type.enum';
import { Injectable } from '@nestjs/common';
import { MongoAdapterRepository } from './mongo-adapter.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class CompositeAdapterRepository implements UserRepository {
  constructor(private mongoAdapterRepository: MongoAdapterRepository) {
  }

  create(newUserPayload: any): Promise<UserEntity> {
    return this.mongoAdapterRepository.create(newUserPayload);
  }

  async readByEmail(emailPayload: any): Promise<UserEntity | null> {
    const adapters = this.getAdapters();

    const userRequests = adapters.map(async (adapter: UserRepository): Promise<UserEntity | null> => {
      try {
        return await adapter.readByEmail(emailPayload);
      } catch {
        return null;
      }
    });

    const users = await Promise.all(userRequests);

    for (const user of users) {
      if (user) {
        return user;
      }
    }

    return null;
  }

  async readById(userIdPayload: any): Promise<UserEntity | null> {
    const adapters = this.getAdapters();

    const userRequests = adapters.map(async (adapter: UserRepository): Promise<UserEntity | null> => {
      try {
        return await adapter.readById(userIdPayload);
      } catch {
        return null;
      }
    });

    const users = await Promise.all(userRequests);

    for (const user of users) {
      if (user) {
        return user;
      }
    }

    return null;
  }

  async readConflictExists(conflictPayload: any): Promise<boolean> {
    const adapters = this.getAdapters();

    const conflictCheckRequests = adapters.map(async (adapter: UserRepository): Promise<boolean> => {
      try {
        return await adapter.readConflictExists(conflictPayload);
      } catch {
        return false;
      }
    });

    const conflictChecks = await Promise.all(conflictCheckRequests);

    for (const conflictCheck of conflictChecks) {
      if (conflictCheck) {
        return true;
      }
    }

    return false;
  }

  update(user: any, editUserPayload: any): Promise<UserEntity> {
    const userEntity = validatePayload(user, UserEntity);

    const adapter = this.getAdapter(userEntity);

    return adapter.update(user, editUserPayload);
  }

  updateCounts(user: any, newCountsPayload: any): Promise<UserEntity> {
    const userEntity = validatePayload(user, UserEntity);

    const adapter = this.getAdapter(userEntity);

    return adapter.updateCounts(user, newCountsPayload);
  }

  private getAdapter(user: UserEntity): UserRepository {
    const { type } = user;

    switch (type) {
      case AdapterType.Mongo:
        return this.mongoAdapterRepository;
    }
  }

  private getAdapters(): UserRepository[] {
    return [
      this.mongoAdapterRepository
    ];
  }
};
