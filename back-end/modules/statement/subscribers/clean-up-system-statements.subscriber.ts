import { StatementEntity } from '@/statement/statement.entity';
import { SystemEntity } from '@/system/system.entity';
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class CleanUpSystemStatementsSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): Function | string {
    return SystemEntity;
  }

  async beforeRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { _id } = databaseEntity;

    const statementRepository = connection.getMongoRepository(StatementEntity);

    const statements = await statementRepository.find({
      systemId: _id
    });

    await statementRepository.remove(statements);
  }
};
