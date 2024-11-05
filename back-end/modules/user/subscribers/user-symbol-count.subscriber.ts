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

    this.adjustSymbolCounts(connection, entity);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    this.adjustSymbolCounts(connection, databaseEntity);
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

    this.adjustSymbolCounts(connection, databaseEntity);
  }

  private async adjustSymbolCounts(connection: DataSource, symbol: SymbolEntity): Promise<void> {
    const { createdByUserId } = symbol;

    const symbolRepository = connection.getMongoRepository(SymbolEntity);
    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.constantSymbolCount = await symbolRepository.count({
      type: SymbolType.Constant,
      createdByUserId
    });
    user.variableSymbolCount = await symbolRepository.count({
      type: SymbolType.Variable,
      createdByUserId
    });

    userRepository.save(user);
  }
};
