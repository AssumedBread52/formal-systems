import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { getRepositoryMock } from '@/common/tests/mocks/get-repository.mock';
import { managerMock } from '@/common/tests/mocks/manager.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { transactionMock } from '@/common/tests/mocks/transaction.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Delete Statement', (): void => {
  const findBy = findByMock();
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

  it('DELETE /system/:systemId/statement/:statementId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type: HypothesisType.type
    }, HypothesisEntity);
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id: '630e5c73-6231-4128-aae6-1d528f6b4de4',
      variableSymbol2Id:  'e8172cec-118f-4185-a405-a6cf46869ee0'
    }, DistinctVariablePairEntity);

    findBy.mockResolvedValueOnce([
      hypothesis
    ]);
    findBy.mockResolvedValueOnce([
      distinctVariablePair
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce([
      hypothesis
    ]);
    remove.mockResolvedValueOnce([
      distinctVariablePair
    ]);
    remove.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(findBy).toHaveBeenCalledTimes(2);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      systemId,
      statementId
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: statementId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(3);
    expect(getRepository).toHaveBeenNthCalledWith(1, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, DistinctVariablePairEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenNthCalledWith(1, [
      hypothesis
    ]);
    expect(remove).toHaveBeenNthCalledWith(2, [
      distinctVariablePair
    ]);
    expect(remove).toHaveBeenNthCalledWith(3, statement);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(statement));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation deleteStatement', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type: HypothesisType.type
    }, HypothesisEntity);
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id: '630e5c73-6231-4128-aae6-1d528f6b4de4',
      variableSymbol2Id:  'e8172cec-118f-4185-a405-a6cf46869ee0'
    }, DistinctVariablePairEntity);

    findBy.mockResolvedValueOnce([
      hypothesis
    ]);
    findBy.mockResolvedValueOnce([
      distinctVariablePair
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce([
      hypothesis
    ]);
    remove.mockResolvedValueOnce([
      distinctVariablePair
    ]);
    remove.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $statementId: String!) { deleteStatement(systemId: $systemId, statementId: $statementId) { id systemId assertionExpressionId name description } }',
      variables: {
        systemId,
        statementId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(2);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      systemId,
      statementId
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: statementId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(3);
    expect(getRepository).toHaveBeenNthCalledWith(1, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, DistinctVariablePairEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenNthCalledWith(1, [
      hypothesis
    ]);
    expect(remove).toHaveBeenNthCalledWith(2, [
      distinctVariablePair
    ]);
    expect(remove).toHaveBeenNthCalledWith(3, statement);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({
      data: {
        deleteStatement: instanceToPlain(statement)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
