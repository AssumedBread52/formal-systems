import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserSymbolCountSubscriber extends BaseCountSubscriber<SymbolEntity> {
  constructor() {
    super(SymbolEntity);
  }

  protected async adjustCount(connection: DataSource, entity: SymbolEntity, shouldIncrement: boolean): Promise<void> {
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
        if (shouldIncrement) {
          user.constantSymbolCount++;
        } else {
          user.constantSymbolCount--;
        }
        break;
      case SymbolType.Variable:
        if (shouldIncrement) {
          user.variableSymbolCount++;
        } else {
          user.variableSymbolCount--;
        }
        break;
    }

    await userRepository.save(user);
  }

  protected shouldAdjust(oldEntity: SymbolEntity, newEntity: SymbolEntity): boolean {
    const { type: oldType } = oldEntity;
    const { type: newType } = newEntity;

    return oldType !== newType;
  }
};
