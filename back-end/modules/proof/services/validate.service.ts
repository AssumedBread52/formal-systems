import { BaseValidateService } from '@/common/services/base-validate.service';
import { ProofUniqueTitleException } from '@/proof/exceptions/proof-unique-title.exception';
import { ProofEntity } from '@/proof/proof.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>) {
    super();
  }

  async conflictCheck(title: string, systemId: ObjectId, statementId: ObjectId): Promise<void> {
    const collision = await this.proofRepository.findOneBy({
      title,
      statementId,
      systemId
    });

    if (collision) {
      throw new ProofUniqueTitleException();
    }
  }
};
