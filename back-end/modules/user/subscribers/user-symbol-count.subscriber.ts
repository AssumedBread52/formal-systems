import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class UserSymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  listenTo(): Function | string {
    return SymbolEntity;
  }

  async afterInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustUserSymbolCounts(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustUserSymbolCounts(connection, databaseEntity, false);
  }

  async afterUpdate(event: UpdateEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    const { type } = databaseEntity;

    if (type === entity.type) {
      return;
    }

    await this.adjustUserSymbolCounts(connection, databaseEntity, false);
    await this.adjustUserSymbolCounts(connection, entity as SymbolEntity, true);
  }

  private async adjustUserSymbolCounts(connection: DataSource, symbol: SymbolEntity, increment: boolean): Promise<void> {
    const { type, createdByUserId } = symbol;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        if (increment) {
          user.constantSymbolCount++;
        } else {
          user.constantSymbolCount--;
        }
        break;
      case SymbolType.Variable:
        if (increment) {
          user.variableSymbolCount++;
        } else {
          user.variableSymbolCount--;
        }
        break;
    }

    await userRepository.save(user);
  }
};
