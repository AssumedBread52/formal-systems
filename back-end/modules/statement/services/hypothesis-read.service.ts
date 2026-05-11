import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisNotFoundException } from '@/statement/exceptions/hypothesis-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HypothesisReadService {
  public constructor(@InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
  }

  public async selectById(systemId: string, statementId: string, hypothesisId: string): Promise<HypothesisEntity> {
    try {
      const hypothesis = await this.repository.findOneBy({
        id: hypothesisId,
        systemId,
        statementId
      });

      if (!hypothesis) {
        throw new HypothesisNotFoundException();
      }

      return hypothesis;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading hypothesis failed');
    }
  }
};
