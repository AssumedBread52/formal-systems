import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExpressionReadService {
  public constructor(@InjectRepository(ExpressionEntity) private readonly repository: Repository<ExpressionEntity>) {
  }

  public async selectById(systemId: string, expressionId: string): Promise<ExpressionEntity> {
    try {
      const expression = await this.repository.findOneBy({
        id: expressionId,
        systemId
      });

      if (!expression) {
        throw new ExpressionNotFoundException();
      }

      return expression;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading expression failed');
    }
  }
};
