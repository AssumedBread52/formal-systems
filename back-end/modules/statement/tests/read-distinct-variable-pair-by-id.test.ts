import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Read Distinct Variable Pair by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/statement/:statementId/distinct-variable-pair/:variableSymbol1Id/:variableSymbol2Id', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const variableSymbol2Id = 'e8172cec-118f-4185-a405-a6cf46869ee0';
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    findOneBy.mockResolvedValueOnce(distinctVariablePair);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement/${statementId}/distinct-variable-pair/${variableSymbol1Id}/${variableSymbol2Id}`);

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual(instanceToPlain(distinctVariablePair));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query distinctVariablePair', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const variableSymbol2Id = 'e8172cec-118f-4185-a405-a6cf46869ee0';
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    findOneBy.mockResolvedValueOnce(distinctVariablePair);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { distinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId statementId variableSymbol1Id variableSymbol2Id } }',
      variables: {
        systemId,
        statementId,
        variableSymbol1Id,
        variableSymbol2Id
      }
    });

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        distinctVariablePair: instanceToPlain(distinctVariablePair)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
