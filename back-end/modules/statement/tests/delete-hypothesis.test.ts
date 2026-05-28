import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { getRepositoryMock } from '@/common/tests/mocks/get-repository.mock';
import { managerMock } from '@/common/tests/mocks/manager.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { transactionMock } from '@/common/tests/mocks/transaction.mock';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Delete Hypothesis', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const getRepository = getRepositoryMock();
  const manager = managerMock();
  const remove = removeMock();
  const transaction = transactionMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId/statement/:statementId/hypothesis/:hypothesisId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesisId = '72b9158b-bba0-46c7-b898-5e80a64d1ed4';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const hypothesis = validatePayload({
      id: hypothesisId,
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type: HypothesisType.type
    }, HypothesisEntity);

    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(hypothesis);
    remove.mockResolvedValueOnce(hypothesis);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}/hypothesis/${hypothesisId}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
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
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: hypothesisId,
      systemId,
      statementId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, HypothesisEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, hypothesis);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(hypothesis));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation deleteHypothesis', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesisId = '72b9158b-bba0-46c7-b898-5e80a64d1ed4';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const hypothesis = validatePayload({
      id: hypothesisId,
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type: HypothesisType.type
    }, HypothesisEntity);

    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(hypothesis);
    remove.mockResolvedValueOnce(hypothesis);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $hypothesisId: String!) { deleteHypothesis(systemId: $systemId, statementId: $statementId, hypothesisId: $hypothesisId) { id systemId statementId expressionId type } }',
      variables: {
        systemId,
        statementId,
        hypothesisId
      }
    });

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
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
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: hypothesisId,
      systemId,
      statementId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, HypothesisEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, hypothesis);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({
      data: {
        deleteHypothesis: instanceToPlain(hypothesis)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
