import { StatementEntity } from '@/statement/statement.entity';
import { SystemEntity } from '@/system/system.entity';
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class CleanUpSystemStatementsSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): string | Function {
    return SystemEntity;
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { _id } = databaseEntity;

    const statementRepository = connection.getMongoRepository(StatementEntity);

    const statements = await statementRepository.find({
      systemId: _id
    });

    statementRepository.remove(statements);
  }
};
