import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { ProofEntity } from '@/proof/proof.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserProofCountSubscriber extends BaseCountSubscriber<ProofEntity> {
  constructor() {
    super(ProofEntity);
  }

  protected async adjustCount(connection: DataSource, entity: ProofEntity, shouldIncrement: boolean): Promise<void> {
    const { createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(UserEntity);

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
