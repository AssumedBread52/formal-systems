import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { ProofEntity } from '@/proof/proof.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class SystemProofCountSubscriber extends BaseCountSubscriber<ProofEntity> {
  constructor() {
    super(ProofEntity);
  }

  protected async adjustCount(connection: DataSource, entity: ProofEntity, shouldIncrement: boolean): Promise<void> {
    const { systemId } = entity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    if (shouldIncrement) {
      system.proofCount++;
    } else {
      system.proofCount--;
    }

    await systemRepository.save(system);
  }

  protected shouldAdjust = undefined;
};
