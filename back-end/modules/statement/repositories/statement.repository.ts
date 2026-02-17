import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoStatementEntity } from '@/statement/entities/mongo-statement.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { ConstantPrefixedExpressionPayload } from '@/statement/payloads/constant-prefixed-expression.payload';
import { ConstantVariablePairExpressionPayload } from '@/statement/payloads/constant-variable-pair-expression.payload';
import { DistinctVariablePairPayload } from '@/statement/payloads/distinct-variable-pair.payload';
import { FindAndCountPayload } from '@/statement/payloads/find-and-count.payload';
import { FindOneByPayload } from '@/statement/payloads/find-one-by.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Filter, MongoRepository } from 'typeorm';

@Injectable()
export class StatementRepository {
  public constructor(@InjectRepository(MongoStatementEntity) private readonly repository: MongoRepository<MongoStatementEntity>) {
  }

  public async findAndCount(findAndCountPayload: FindAndCountPayload): Promise<[StatementEntity[], number]> {
    try {
      const validatedFindAndCountPayload = validatePayload(findAndCountPayload, FindAndCountPayload);

      const where = {
        systemId: new ObjectId(validatedFindAndCountPayload.systemId)
      } as Filter<MongoStatementEntity>;

      if (0 < validatedFindAndCountPayload.keywords.length) {
        where.$text = {
          $caseSensitive: false,
          $search: validatedFindAndCountPayload.keywords.join(',')
        };
      }

      const [mongoStatements, total] = await this.repository.findAndCount({
        skip: validatedFindAndCountPayload.skip,
        take: validatedFindAndCountPayload.take,
        where
      });

      const statements = mongoStatements.map(this.createDomainEntityFromDatabaseEntity);

      return [
        statements.map((statement: StatementEntity): StatementEntity => {
          return validatePayload(statement, StatementEntity);
        }),
        total
      ];
    } catch {
      throw new Error('Finding statements failed');
    }
  }

  public async findOneBy(findOneByPayload: FindOneByPayload): Promise<StatementEntity | null> {
    try {
      const validatedFindOneByPayload = validatePayload(findOneByPayload, FindOneByPayload);

      const filters = {} as Filter<MongoStatementEntity>;
      if (validatedFindOneByPayload.id) {
        filters._id = new ObjectId(validatedFindOneByPayload.id);
      }
      if (validatedFindOneByPayload.title) {
        filters.title = validatedFindOneByPayload.title;
      }
      if (validatedFindOneByPayload.systemId) {
        filters.systemId = new ObjectId(validatedFindOneByPayload.systemId);
      }

      const mongoStatement = await this.repository.findOneBy(filters);

      if (!mongoStatement) {
        return null;
      }

      const statement = this.createDomainEntityFromDatabaseEntity(mongoStatement);

      return validatePayload(statement, StatementEntity);
    } catch {
      throw new Error('Finding statement failed');
    }
  }

  public async remove(statement: StatementEntity): Promise<StatementEntity> {
    try {
      const validatedStatement = validatePayload(statement, StatementEntity);

      const mongoStatement = this.createDatabaseEntityFromDomainEntity(validatedStatement);

      const statementId = mongoStatement._id;

      const deletedMongoStatement = await this.repository.remove(mongoStatement);

      deletedMongoStatement._id = statementId;

      const deletedStatement = this.createDomainEntityFromDatabaseEntity(deletedMongoStatement);

      return validatePayload(deletedStatement, StatementEntity);
    } catch {
      throw new Error('Removing statement from database failed');
    }
  }

  public async save(statement: StatementEntity): Promise<StatementEntity> {
    try {
      if (!statement.id) {
        statement.id = (new ObjectId()).toString();
      }

      const validatedStatement = validatePayload(statement, StatementEntity);

      const mongoStatement = this.createDatabaseEntityFromDomainEntity(validatedStatement);

      const savedMongoStatement = await this.repository.save(mongoStatement);

      const savedStatement = this.createDomainEntityFromDatabaseEntity(savedMongoStatement);

      return validatePayload(savedStatement, StatementEntity);
    } catch {
      throw new Error('Saving statement to database failed');
    }
  }

  private createDatabaseEntityFromDomainEntity(statement: StatementEntity): MongoStatementEntity {
    const mongoStatement = new MongoStatementEntity();

    mongoStatement._id = new ObjectId(statement.id);
    mongoStatement.title = statement.title;
    mongoStatement.description = statement.description;
    mongoStatement.distinctVariableRestrictions = statement.distinctVariableRestrictions.map((distinctVariableRestriction: DistinctVariablePairPayload): [ObjectId, ObjectId] => {
      return [
        new ObjectId(distinctVariableRestriction.variableSymbolIds[0]),
        new ObjectId(distinctVariableRestriction.variableSymbolIds[1])
      ];
    });
    mongoStatement.variableTypeHypotheses = statement.variableTypeHypotheses.map((variableTypeHypothesis: ConstantVariablePairExpressionPayload): [ObjectId, ObjectId] => {
      return [
        new ObjectId(variableTypeHypothesis.prefixedConstantSymbolId),
        new ObjectId(variableTypeHypothesis.suffixedVariableSymbolId)
      ];
    });
    mongoStatement.logicalHypotheses = statement.logicalHypotheses.map((logicalHypothesis: ConstantPrefixedExpressionPayload): [ObjectId, ...ObjectId[]] => {
      return [
        new ObjectId(logicalHypothesis.prefixedConstantSymbolId),
        ...logicalHypothesis.suffixedExpressionSymbolIds.map((symbolId: string): ObjectId => {
          return new ObjectId(symbolId);
        })
      ];
    });
    mongoStatement.assertion = [
      new ObjectId(statement.assertion.prefixedConstantSymbolId),
      ...statement.assertion.suffixedExpressionSymbolIds.map((symbolId: string): ObjectId => {
        return new ObjectId(symbolId);
      })
    ];
    mongoStatement.proofCount = statement.proofCount;
    mongoStatement.proofAppearanceCount = statement.proofAppearanceCount;
    mongoStatement.systemId = new ObjectId(statement.systemId);
    mongoStatement.createdByUserId = new ObjectId(statement.createdByUserId);

    return mongoStatement;
  }

  private createDomainEntityFromDatabaseEntity(mongoStatement: MongoStatementEntity): StatementEntity {
    const statement = new StatementEntity();

    statement.id = mongoStatement._id.toString();
    statement.title = mongoStatement.title;
    statement.description = mongoStatement.description;
    statement.distinctVariableRestrictions = mongoStatement.distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): DistinctVariablePairPayload => {
      const distinctVariablePairPayload = new DistinctVariablePairPayload();

      distinctVariablePairPayload.variableSymbolIds = [
        distinctVariableRestriction[0].toString(),
        distinctVariableRestriction[1].toString()
      ];

      return distinctVariablePairPayload;
    });
    statement.variableTypeHypotheses = mongoStatement.variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): ConstantVariablePairExpressionPayload => {
      const constantVariablePairExpressionPayload = new ConstantVariablePairExpressionPayload();

      constantVariablePairExpressionPayload.symbolIds = [
        variableTypeHypothesis[0].toString(),
        variableTypeHypothesis[1].toString()
      ];

      return constantVariablePairExpressionPayload;
    });
    statement.logicalHypotheses = mongoStatement.logicalHypotheses.map((logicalHypothesis: [ObjectId, ...ObjectId[]]): ConstantPrefixedExpressionPayload => {
      const [prefix, ...expression] = logicalHypothesis;
      const constantPrefixedExpressionPayload = new ConstantPrefixedExpressionPayload();

      constantPrefixedExpressionPayload.symbolIds = [
        prefix.toString(),
        ...expression.map((symbolId: ObjectId): string => {
          return symbolId.toString();
        })
      ];

      return constantPrefixedExpressionPayload;
    });
    const [prefix, ...expression] = mongoStatement.assertion;
    const constantPrefixedExpressionPayload = new ConstantPrefixedExpressionPayload();

    constantPrefixedExpressionPayload.symbolIds = [
      prefix.toString(),
      ...expression.map((symbolId: ObjectId): string => {
        return symbolId.toString();
      })
    ];

    statement.assertion = constantPrefixedExpressionPayload;
    statement.proofCount = mongoStatement.proofCount;
    statement.proofAppearanceCount = mongoStatement.proofAppearanceCount;
    statement.systemId = mongoStatement.systemId.toString();
    statement.createdByUserId = mongoStatement.createdByUserId.toString();

    return statement;
  }
};
