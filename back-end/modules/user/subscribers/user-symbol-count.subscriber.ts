import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class UserSymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  listenTo(): string | Function {
    return SymbolEntity;
  }

  async afterInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { connection, entity } = event;

    const { type, createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('User not found.');
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

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { type, createdByUserId } = databaseEntity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('User not found.');
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

  async afterUpdate(event: UpdateEvent<SymbolEntity>): Promise<void> {
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
      throw new NotFoundException('User not found.');
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
