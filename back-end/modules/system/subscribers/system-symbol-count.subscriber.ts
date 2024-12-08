import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class SystemSymbolCountSubscriber extends BaseCountSubscriber<SymbolEntity> {
  constructor() {
    super(SymbolEntity);
  }

  protected async adjustCount(connection: DataSource, entity: SymbolEntity, shouldIncrement: boolean): Promise<void> {
    const { type, systemId } = entity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        if (shouldIncrement) {
          system.constantSymbolCount++;
        } else {
          system.constantSymbolCount--;
        }
        break;
      case SymbolType.Variable:
        if (shouldIncrement) {
          system.variableSymbolCount++;
        } else {
          system.variableSymbolCount--;
        }
        break;
    }

    await systemRepository.save(system);
  }

  protected shouldAdjust(oldEntity: SymbolEntity, newEntity: SymbolEntity): boolean {
    const { type: oldType } = oldEntity;
    const { type: newType } = newEntity;

    return oldType !== newType;
  }
};
