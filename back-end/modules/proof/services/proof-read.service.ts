import { ProofNotFoundException } from '@/proof/exceptions/proof-not-found.exception';
import { SearchPayload } from '@/proof/payloads/search.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class ProofReadService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>, private validateService: ValidateService) {
  }

  async readById(systemId: any, statementId: any, proofId: any): Promise<ProofEntity> {
    const proof = await this.proofRepository.findOneBy({
      _id: this.validateService.idCheck(proofId),
      statementId: this.validateService.idCheck(statementId),
      systemId: this.validateService.idCheck(systemId)
    });

    if (!proof) {
      throw new ProofNotFoundException();
    }

    return proof;
  }

  readProofs(containingSystemId: any, containingStatementId: any, payload: any): Promise<[ProofEntity[], number]> {
    const searchPayload = this.validateService.payloadCheck(payload, SearchPayload);
    const statementId = this.validateService.idCheck(containingStatementId);
    const systemId = this.validateService.idCheck(containingSystemId);

    const { page, count, keywords } = searchPayload;
    const where = {
      statementId,
      systemId
    } as RootFilterOperators<ProofEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    return this.proofRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }
};
