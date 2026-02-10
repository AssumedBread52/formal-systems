import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { IsDistinctPairDecorator } from '@/common/decorators/is-distinct-pair.decorator';
import { IsExpressionDecorator } from '@/common/decorators/is-expression.decorator';
import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UnprocessableEntityException, UseGuards, ValidationPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassConstructor, plainToClass, Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, isArray, IsInt, isMongoId, IsNotEmpty, Min, validateSync } from 'class-validator';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';

class StatementPayload {
  id: string;
  title: string;
  description: string;
  distinctVariableRestrictions: [string, string][];
  variableTypeHypotheses: [string, string][];
  logicalHypotheses: [string, ...string[]][];
  assertion: [string, ...string[]];
  proofCount: number;
  proofAppearanceCount: number;
  systemId: string;
  createdByUserId: string;

  constructor(statement: StatementEntity) {
    const { _id, title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, proofCount, proofAppearanceCount, systemId, createdByUserId } = statement;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.distinctVariableRestrictions = distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
      const [first, second] = distinctVariableRestriction;

      return [
        first.toString(),
        second.toString()
      ];
    });
    this.variableTypeHypotheses = variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
      const [type, variable] = variableTypeHypothesis;

      return [
        type.toString(),
        variable.toString()
      ];
    });
    this.logicalHypotheses = logicalHypotheses.map((logicalHypothesis: [ObjectId, ...ObjectId[]]): [string, ...string[]] => {
      const [prefix, ...expression] = logicalHypothesis;

      return [
        prefix.toString(),
        ...expression.map((symbolId: ObjectId): string => {
          return symbolId.toString();
        })
      ];
    });
    const [prefix, ...expression] = assertion;
    this.assertion = [
      prefix.toString(),
      ...expression.map((symbolId: ObjectId): string => {
        return symbolId.toString();
      })
    ];
    this.proofCount = proofCount;
    this.proofAppearanceCount = proofAppearanceCount;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};

class SearchPayload {
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  page: number = 1;
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  count: number = 10;
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  keywords: string[] = [];
};

class EditStatementPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  @ArrayUnique((element: any): string => {
    if (!isArray(element) || 2 !== element.length) {
      return '';
    }

    const first = `${element[0]}`;
    const second = `${element[1]}`;

    if (first.localeCompare(second) < 0) {
      return `${first}${second}`;
    } else {
      return `${second}${first}`;
    }
  })
  @IsArray()
  @IsDistinctPairDecorator({
    each: true
  })
  newDistinctVariableRestrictions: [string, string][] = [];
  @ArrayUnique((element: any): string => {
    if (!isArray(element) || 2 !== element.length) {
      return '';
    }

    return `${element[1]}`;
  })
  @IsArray()
  @IsDistinctPairDecorator({
    each: true
  })
  newVariableTypeHypotheses: [string, string][] = [];
  @ArrayMinSize(1, {
    each: true
  })
  @ArrayUnique((element: any): string => {
    if (!isArray(element)) {
      return '';
    }

    return element.map((item: any): string => {
      return `${item}`;
    }).join(',');
  })
  @IsArray()
  @IsExpressionDecorator({
    each: true
  })
  newLogicalHypotheses: [string, ...string[]][] = [];
  @ArrayMinSize(1)
  @IsExpressionDecorator()
  newAssertion: [string, ...string[]] = [''];
};

class NewStatementPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @ArrayUnique((element: any): string => {
    if (!isArray(element) || 2 !== element.length) {
      return '';
    }

    const first = `${element[0]}`;
    const second = `${element[1]}`;

    if (first.localeCompare(second) < 0) {
      return `${first}${second}`;
    } else {
      return `${second}${first}`;
    }
  })
  @IsArray()
  @IsDistinctPairDecorator({
    each: true
  })
  distinctVariableRestrictions: [string, string][] = [];
  @ArrayUnique((element: any): string => {
    if (!isArray(element) || 2 !== element.length) {
      return '';
    }

    return `${element[1]}`;
  })
  @IsArray()
  @IsDistinctPairDecorator({
    each: true
  })
  variableTypeHypotheses: [string, string][] = [];
  @ArrayMinSize(1, {
    each: true
  })
  @ArrayUnique((element: any): string => {
    if (!isArray(element)) {
      return '';
    }

    return element.map((item: any): string => {
      return `${item}`;
    }).join(',');
  })
  @IsArray()
  @IsExpressionDecorator({
    each: true
  })
  logicalHypotheses: [string, ...string[]][] = [];
  @ArrayMinSize(1)
  @IsExpressionDecorator()
  assertion: [string, ...string[]] = [''];
};

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private symbolReadService: SymbolReadService, private systemReadService: SystemReadService, @InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>) {
  }

  @UseGuards(JwtGuard)
  @Delete(':statementId')
  async deleteStatement(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string): Promise<StatementPayload> {
    const statement = await this.statementRepository.findOneBy({
      _id: this.idCheck(statementId),
      systemId: this.idCheck(systemId)
    });

    if (!statement) {
      throw new NotFoundException('Statement not found.');
    }

    const { _id, proofCount, proofAppearanceCount, createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (proofCount > 0 || proofAppearanceCount > 0) {
      throw new UnprocessableEntityException('Statements in use cannot under go write actions.');
    }

    await this.statementRepository.remove(statement);

    statement._id = _id;

    return new StatementPayload(statement);
  }

  @Get()
  async getStatements(@Param('systemId') containingSystemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<StatementPayload>> {
    const searchPayload = this.payloadCheck(payload, SearchPayload);
    const systemId = this.idCheck(containingSystemId);

    const { page, count, keywords } = searchPayload;
    const where = {
      systemId
    } as RootFilterOperators<StatementEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    const [results, total] = await this.statementRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });

    return new PaginatedResultsPayload(results.map(result => new StatementPayload(result)), total);
  }

  @Get(':statementId')
  async getById(@Param('systemId') systemId: string, @Param('statementId') statementId: string): Promise<StatementPayload> {
    const statement = await this.statementRepository.findOneBy({
      _id: this.idCheck(statementId),
      systemId: this.idCheck(systemId)
    });

    if (!statement) {
      throw new NotFoundException('Statement not found.');
    }

    return new StatementPayload(statement);
  }

  @UseGuards(JwtGuard)
  @Patch(':statementId')
  async patchStatement(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') containingSystemId: string, @Param('statementId') statementId: string, @Body() payload: any): Promise<StatementPayload> {
    const statement = await this.statementRepository.findOneBy({
      _id: this.idCheck(statementId),
      systemId: this.idCheck(containingSystemId)
    });

    if (!statement) {
      throw new NotFoundException('Statement not found.');
    }

    const { title, proofCount, proofAppearanceCount, systemId, createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const editStatementPayload = this.payloadCheck(payload, EditStatementPayload);

    const { newTitle, newDescription, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    if (title !== newTitle) {
      await this.conflictCheck(newTitle, systemId);
    }

    await this.editStructureCheck(systemId, editStatementPayload);

    if (proofCount > 0 || proofAppearanceCount > 0) {
      throw new UnprocessableEntityException('Statements in use cannot under go write actions.');
    }

    const [newPrefix, ...newExpression] = newAssertion;

    statement.title = newTitle;
    statement.description = newDescription;
    statement.distinctVariableRestrictions = newDistinctVariableRestrictions.map((newDistinctVariableRestriction: [string, string]): [ObjectId, ObjectId] => {
      const [newFirst, newSecond] = newDistinctVariableRestriction;

      return [
        new ObjectId(newFirst),
        new ObjectId(newSecond)
      ];
    });
    statement.variableTypeHypotheses = newVariableTypeHypotheses.map((newVariableTypeHypothesis: [string, string]): [ObjectId, ObjectId] => {
      const [newType, newVariable] = newVariableTypeHypothesis;

      return [
        new ObjectId(newType),
        new ObjectId(newVariable)
      ];
    });
    statement.logicalHypotheses = newLogicalHypotheses.map((newLogicalHypothesis: [string, ...string[]]): [ObjectId, ...ObjectId[]] => {
      const [newPrefix, ...newExpression] = newLogicalHypothesis;

      return [
        new ObjectId(newPrefix),
        ...newExpression.map((newSymbolId: string): ObjectId => {
          return new ObjectId(newSymbolId);
        })
      ];
    });
    statement.assertion = [
      new ObjectId(newPrefix),
      ...newExpression.map((newSymbolId: string): ObjectId => {
        return new ObjectId(newSymbolId);
      })
    ];

    return new StatementPayload(await this.statementRepository.save(statement));
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUser('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<StatementPayload> {
    const system = await this.systemReadService.selectById(systemId);

    const { id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const newStatementPayload = this.payloadCheck(payload, NewStatementPayload);

    const { title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    await this.conflictCheck(title, new ObjectId(id));

    await this.newStructureCheck(new ObjectId(id), newStatementPayload);

    const [prefix, ...expression] = assertion;

    const statement = new StatementEntity();

    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions.map((distinctVariableRestriction: [string, string]): [ObjectId, ObjectId] => {
      const [first, second] = distinctVariableRestriction;

      return [
        new ObjectId(first),
        new ObjectId(second)
      ];
    });
    statement.variableTypeHypotheses = variableTypeHypotheses.map((variableTypeHypothesis: [string, string]): [ObjectId, ObjectId] => {
      const [type, variable] = variableTypeHypothesis;

      return [
        new ObjectId(type),
        new ObjectId(variable)
      ];
    });
    statement.logicalHypotheses = logicalHypotheses.map((logicalHypothesis: [string, ...string[]]): [ObjectId, ...ObjectId[]] => {
      const [prefix, ...expression] = logicalHypothesis;

      return [
        new ObjectId(prefix),
        ...expression.map((symbolId: string): ObjectId => {
          return new ObjectId(symbolId);
        })
      ];
    });
    statement.assertion = [
      new ObjectId(prefix),
      ...expression.map((symbolId: string): ObjectId => {
        return new ObjectId(symbolId);
      })
    ];
    statement.systemId = new ObjectId(id);
    statement.createdByUserId = sessionUserId;

    return new StatementPayload(await this.statementRepository.save(statement));
  }

  private async conflictCheck(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.statementRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new ConflictException('Statements in the same system must have a unique title.');
    }
  }

  private async newStructureCheck(systemId: ObjectId, newStatementPayload: NewStatementPayload): Promise<void> {
    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    await this.structureCheck(systemId, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion);
  }

  private async editStructureCheck(systemId: ObjectId, editStatementPayload: EditStatementPayload): Promise<void> {
    const { newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    await this.structureCheck(systemId, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion);
  }

  private async structureCheck(systemId: ObjectId, distinctVariableRestrictions: [string, string][], variableTypeHypotheses: [string, string][], logicalHypotheses: [string, ...string[]][], assertion: [string, ...string[]]): Promise<void> {
    const symbolIds = assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    }), {});

    distinctVariableRestrictions.forEach((distinctVariableRestriction: [string, string]): void => {
      const [first, second] = distinctVariableRestriction;

      if (SymbolType.variable !== symbolDictionary[first]!.type) {
        throw new UnprocessableEntityException('Invalid symbol type.');
      }

      if (SymbolType.variable !== symbolDictionary[second]!.type) {
        throw new UnprocessableEntityException('Invalid symbol type.');
      }
    });

    const types = variableTypeHypotheses.reduce((dictionary: Record<string, string>, variableTypeHypothesis: [string, string]): Record<string, string> => {
      const [type, variable] = variableTypeHypothesis;

      if (SymbolType.constant !== symbolDictionary[type]!.type) {
        throw new UnprocessableEntityException('Invalid symbol type.');
      }

      if (SymbolType.variable !== symbolDictionary[variable]!.type) {
        throw new UnprocessableEntityException('Invalid symbol type.');
      }

      dictionary[variable] = type;

      return dictionary;
    }, {});

    [...logicalHypotheses, assertion].forEach((prefixedExpression: [string, ...string[]]): void => {
      const [prefix, ...expression] = prefixedExpression;

      if (SymbolType.constant !== symbolDictionary[prefix]!.type) {
        throw new UnprocessableEntityException('Invalid symbol type.');
      }

      expression.forEach((symbolId: string): void => {
        if (SymbolType.variable !== symbolDictionary[symbolId]!.type) {
          return;
        }

        if (!types[symbolId]) {
          throw new UnprocessableEntityException('All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.');
        }
      });
    });
  }

  private idCheck(id: any): ObjectId {
    if (!isMongoId(id)) {
      throw new InvalidObjectIdException();
    }

    return new ObjectId(id);
  }

  private payloadCheck<Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload {
    const newPayload = plainToClass(payloadConstructor, payload);

    const errors = validateSync(newPayload);

    if (0 < errors.length) {
      const validationPipe = new ValidationPipe();

      throw validationPipe.createExceptionFactory()(errors);
    }

    return newPayload;
  }
};
