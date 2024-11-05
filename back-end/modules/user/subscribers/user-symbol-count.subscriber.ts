import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class UserSymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  listenTo(): Function | string {
    return SymbolEntity;
  }

  async beforeInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { connection, entity } = event;

    const { type, createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        user.constantSymbolCount++;
        break;
      case SymbolType.Variable:
        user.variableSymbolCount++;
        break;
    }

    userRepository.save(user);
  }

  async beforeRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { type, createdByUserId } = databaseEntity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        user.constantSymbolCount--;
        break;
      case SymbolType.Variable:
        user.variableSymbolCount--;
        break;
    }

    userRepository.save(user);
  }

  async beforeUpdate(event: UpdateEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    const { type, createdByUserId } = databaseEntity;

    if (type === entity.type) {
      return;
    }

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        user.constantSymbolCount--;
        user.variableSymbolCount++;
        break;
      case SymbolType.Variable:
        user.constantSymbolCount++;
        user.variableSymbolCount--;
        break;
    }

    userRepository.save(user);
  }
};
