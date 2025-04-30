import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { ProofEntity } from '@/proof/proof.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserProofCountSubscriber extends BaseCountSubscriber<ProofEntity> {
  constructor() {
    super(ProofEntity);
  }

  protected async adjustCount(connection: DataSource, entity: ProofEntity, shouldIncrement: boolean): Promise<void> {
    const { createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(MongoUserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (shouldIncrement) {
      user.proofCount++;
    } else {
      user.proofCount--;
    }

    await userRepository.save(user);
  }

  protected shouldAdjust = undefined;
};
