import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { MongoExpressionEntity } from '@/expression/entities/mongo-expression.entity';
import { FindAndCountPayload } from '@/expression/payloads/find-and-count.payload';
import { FindOneByPayload } from '@/expression/payloads/find-one-by.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Filter, MongoRepository } from 'typeorm';

@Injectable()
export class ExpressionRepository {
  public constructor(@InjectRepository(MongoExpressionEntity) private readonly repository: MongoRepository<MongoExpressionEntity>) {
  }

  public async findAndCount(findAndCountPayload: FindAndCountPayload): Promise<[ExpressionEntity[], number]> {
    try {
      const validatedFindAndCountPayload = validatePayload(findAndCountPayload, FindAndCountPayload);

      const where = {
        systemId: new ObjectId(validatedFindAndCountPayload.systemId)
      } as Filter<MongoExpressionEntity>;
      if (0 < validatedFindAndCountPayload.mustIncludeSymbolIds.length || 0 < validatedFindAndCountPayload.mayIncludeSymbolIds.length) {
        where.symbolIds = {};
        if (0 < validatedFindAndCountPayload.mustIncludeSymbolIds.length) {
          where.symbolIds.$all = validatedFindAndCountPayload.mustIncludeSymbolIds.map((symbolId: string): ObjectId => {
            return new ObjectId(symbolId);
          });
        }
        if (0 < validatedFindAndCountPayload.mayIncludeSymbolIds.length) {
          where.symbolIds.$in = validatedFindAndCountPayload.mayIncludeSymbolIds.map((symbolId: string): ObjectId => {
            return new ObjectId(symbolId);
          });
        }
      }
      if (0 < validatedFindAndCountPayload.types.length) {
        where.type = {
          $in: validatedFindAndCountPayload.types
        };
      }

      const [mongoExpressions, total] = await this.repository.findAndCount({
        skip: validatedFindAndCountPayload.skip,
        take: validatedFindAndCountPayload.take,
        where
      });

      const expressions = mongoExpressions.map(this.createDomainEntityFromDatabaseEntity);

      return [
        expressions.map((expression: ExpressionEntity): ExpressionEntity => {
          return validatePayload(expression, ExpressionEntity);
        }),
        total
      ];
    } catch {
      throw new Error('Finding and counting expressions failed');
    }
  }

  public async findOneBy(findOneByPayload: FindOneByPayload): Promise<ExpressionEntity | null> {
    try {
      const validatedFindOneByPayload = validatePayload(findOneByPayload, FindOneByPayload);

      const filters = {} as Filter<MongoExpressionEntity>;
      if (validatedFindOneByPayload.id) {
        filters._id = new ObjectId(validatedFindOneByPayload.id);
      }
      if (validatedFindOneByPayload.symbolIds) {
        filters.symbolIds = validatedFindOneByPayload.symbolIds.map((symbolId: string): ObjectId => {
          return new ObjectId(symbolId);
        });
      }
      if (validatedFindOneByPayload.systemId) {
        filters.systemId = new ObjectId(validatedFindOneByPayload.systemId);
      }

      const mongoExpression = await this.repository.findOneBy(filters);

      if (!mongoExpression) {
        return null;
      }

      const expression = this.createDomainEntityFromDatabaseEntity(mongoExpression);

      return validatePayload(expression, ExpressionEntity);
    } catch {
      throw new Error('Finding expression failed');
    }
  }

  public async remove(expression: ExpressionEntity): Promise<ExpressionEntity> {
    try {
      const validatedExpression = validatePayload(expression, ExpressionEntity);

      const mongoExpression = this.createDatabaseEntityFromDomainEntity(validatedExpression);

      const expressionId = mongoExpression._id;

      const deletedMongoExpression = await this.repository.remove(mongoExpression);

      deletedMongoExpression._id = expressionId;

      const deletedExpression = this.createDomainEntityFromDatabaseEntity(deletedMongoExpression);

      return validatePayload(deletedExpression, ExpressionEntity);
    } catch {
      throw new Error('Removing expression from database failed');
    }
  }

  public async save(expression: ExpressionEntity): Promise<ExpressionEntity> {
    try {
      if (!expression.id) {
        expression.id = (new ObjectId()).toString();
      }

      const validatedExpression = validatePayload(expression, ExpressionEntity);

      const mongoExpression = this.createDatabaseEntityFromDomainEntity(validatedExpression);

      const savedMongoExpression = await this.repository.save(mongoExpression);

      const savedExpression = this.createDomainEntityFromDatabaseEntity(savedMongoExpression);

      return validatePayload(savedExpression, ExpressionEntity);
    } catch {
      throw new Error('Saving expression to database failed');
    }
  }

  private createDatabaseEntityFromDomainEntity(expression: ExpressionEntity): MongoExpressionEntity {
    const mongoExpression = new MongoExpressionEntity();

    mongoExpression._id = new ObjectId(expression.id);
    mongoExpression.symbolIds = expression.symbolIds.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    });
    mongoExpression.type = expression.type;
    mongoExpression.systemId = new ObjectId(expression.systemId);
    mongoExpression.createdByUserId = new ObjectId(expression.createdByUserId);

    return mongoExpression;
  }

  private createDomainEntityFromDatabaseEntity(mongoExpression: MongoExpressionEntity): ExpressionEntity {
    const expression = new ExpressionEntity();

    expression.id = mongoExpression._id.toString();
    expression.symbolIds = mongoExpression.symbolIds.map((symbolId: ObjectId): string => {
      return symbolId.toString();
    });
    expression.type = mongoExpression.type;
    expression.systemId = mongoExpression.systemId.toString();
    expression.createdByUserId = mongoExpression.createdByUserId.toString();

    return expression;
  }
};
