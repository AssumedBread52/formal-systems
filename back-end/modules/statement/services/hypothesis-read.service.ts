import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HypothesisNotFoundException } from '@/statement/exceptions/hypothesis-not-found.exception';
import { TypeHypothesisInUseException } from '@/statement/exceptions/type-hypothesis-in-use.exception';
import { UniqueHypothesisExpressionException } from '@/statement/exceptions/unique-hypothesis-expression.exception';
import { UniqueVariableSymbolTypeException } from '@/statement/exceptions/unique-variable-symbol-type.exception';
import { VariableSymbolNotTypedException } from '@/statement/exceptions/variable-symbol-not-typed.exception';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, EntityManager, FindOptionsWhere, In, Not, Repository } from 'typeorm';

@Injectable()
export class HypothesisReadService {
  public constructor(@InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
  }

  public async searchHypotheses(systemId: string, statementId: string, searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    try {
      const validatedSearchHypothesesPayload = validatePayload(searchHypothesesPayload, SearchHypothesesPayload);

      const take = validatedSearchHypothesesPayload.pageSize;
      const skip = (validatedSearchHypothesesPayload.page - 1) * validatedSearchHypothesesPayload.pageSize;

      const where = {
        systemId,
        statementId
      } as FindOptionsWhere<HypothesisEntity>;
      const includeFilter = In(validatedSearchHypothesesPayload.includeExpressionIds);
      const excludeFilter = Not(In(validatedSearchHypothesesPayload.excludeExpressionIds));
      if (0 < validatedSearchHypothesesPayload.includeExpressionIds.length && 0 < validatedSearchHypothesesPayload.excludeExpressionIds.length) {
        where.expressionId = And(includeFilter, excludeFilter);
      } else if (0 < validatedSearchHypothesesPayload.includeExpressionIds.length) {
        where.expressionId = includeFilter;
      } else if (0 < validatedSearchHypothesesPayload.excludeExpressionIds.length) {
        where.expressionId = excludeFilter;
      }
      if (0 < validatedSearchHypothesesPayload.types.length) {
        where.type = In(validatedSearchHypothesesPayload.types);
      }

      const [hypotheses, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedHypothesesPayload(hypotheses, total);
    } catch {
      throw new InternalServerErrorException('Reading hypotheses failed');
    }
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

  public async verifyAllSymbolsInExpressionTyped(entityManager: EntityManager, statementId: string, expressionId: string): Promise<void> {
    try {
      const expressionTokenRepository = entityManager.getRepository(ExpressionTokenEntity);

      const variableSymbolCount = await expressionTokenRepository.countBy({
        expressionId,
        symbol: {
          type: SymbolType.variable
        }
      });

      const relevantHypothesesCount = await expressionTokenRepository.countBy({
        expressionId,
        symbol: {
          type: SymbolType.variable,
          expressionTokens: {
            position: 1,
            expression: {
              hypotheses: {
                statementId,
                type: HypothesisType.type
              }
            }
          }
        }
      });

      if (variableSymbolCount !== relevantHypothesesCount) {
        throw new VariableSymbolNotTypedException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying all symbols in expression are typed failed');
    }
  }

  public async verifyAllSymbolsInExpressionTypedByProposed(entityManager: EntityManager, typeHypothesesExpressionIds: string[], expressionId: string): Promise<void> {
    try {
      const expressionTokenRepository = entityManager.getRepository(ExpressionTokenEntity);

      const variableSymbolCount = await expressionTokenRepository.countBy({
        expressionId,
        symbol: {
          type: SymbolType.variable
        }
      });

      const relevantHypothesesCount = await expressionTokenRepository.countBy({
        expressionId,
        symbol: {
          type: SymbolType.variable,
          expressionTokens: {
            expressionId: In(typeHypothesesExpressionIds),
            position: 1
          }
        }
      });

      if (variableSymbolCount !== relevantHypothesesCount) {
        throw new VariableSymbolNotTypedException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying all symbols in expression are typed failed');
    }
  }

  public async verifyAllSymbolsTyped(entityManager: EntityManager, systemId: string, statementId: string, variableSymbolIds: string[]): Promise<void> {
    try {
      const symbolRepository = entityManager.getRepository(SymbolEntity);

      const uniqueVariableSymbolIds = variableSymbolIds.reduce((uniqueVariableSymbolIds: string[], variableSymbolId: string): string[] => {
        if (!uniqueVariableSymbolIds.includes(variableSymbolId)) {
          uniqueVariableSymbolIds.push(variableSymbolId);
        }

        return uniqueVariableSymbolIds;
      }, []);

      const count = await symbolRepository.countBy({
        id: In(uniqueVariableSymbolIds),
        systemId,
        expressionTokens: {
          position: 1,
          expression: {
            hypotheses: {
              statementId,
              type: HypothesisType.type
            }
          }
        }
      });

      if (count !== uniqueVariableSymbolIds.length) {
        throw new VariableSymbolNotTypedException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying all symbols are typed failed');
    }
  }

  public async verifyTypeHypothesisNotInUse(entityManager: EntityManager, statementId: string, hypothesisId: string): Promise<void> {
    try {
      const hypothesisRepository = entityManager.getRepository(HypothesisEntity);

      const inUse = await hypothesisRepository.existsBy({
        id: hypothesisId,
        type: HypothesisType.type,
        expression: {
          expressionTokens: {
            position: 1,
            symbol: [
              {
                expressionTokens: {
                  expression: [
                    {
                      hypotheses: {
                        statementId,
                        type: HypothesisType.logic
                      }
                    },
                    {
                      statements: {
                        id: statementId
                      }
                    }
                  ]
                }
              },
              {
                distinctVariable1Pairs: {
                  statementId
                }
              },
              {
                distinctVariable2Pairs: {
                  statementId
                }
              }
            ]
          }
        }
      });

      if (inUse) {
        throw new TypeHypothesisInUseException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying type hypothesis not in use failed');
    }
  }

  public async verifyUniqueHypothesisExpression(statementId: string, expressionId: string): Promise<void> {
    try {
      const conflict = await this.repository.existsBy({
        statementId,
        expressionId
      });

      if (conflict) {
        throw new UniqueHypothesisExpressionException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique expression failed');
    }
  }

  public async verifyUniqueVariableSymbolType(entityManager: EntityManager, statementId: string, expressionId: string): Promise<void> {
    try {
      const hypothesisRepository = entityManager.getRepository(HypothesisEntity);

      const conflict = await hypothesisRepository.existsBy({
        statementId,
        type: HypothesisType.type,
        expression: {
          expressionTokens: {
            position: 1,
            symbol: {
              expressionTokens: {
                expressionId,
                position: 1
              }
            }
          }
        }
      });

      if (conflict) {
        throw new UniqueVariableSymbolTypeException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique variable symbol type failed');
    }
  }

  public async verifyUniqueVariableSymbolTypeByProposed(entityManager: EntityManager, typeHypothesesExpressionIds: string[]): Promise<void> {
    try {
      const symbolRepository = entityManager.getRepository(SymbolEntity);

      const typedVariableCount = await symbolRepository.countBy({
        expressionTokens: {
          expressionId: In(typeHypothesesExpressionIds),
          position: 1
        }
      });

      if (typedVariableCount !== typeHypothesesExpressionIds.length) {
        throw new UniqueVariableSymbolTypeException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique variable symbol type failed');
    }
  }
};
