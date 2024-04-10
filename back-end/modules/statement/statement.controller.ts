import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolService } from '@/symbol/symbol.service';
import { SystemService } from '@/system/system.service';
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { StatementPayload } from './payloads/statement.payload';
import { StatementService } from './statement.service';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementService: StatementService, private symbolService: SymbolService, private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':statementId')
  async deleteStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('statementId') statementId: ObjectId): Promise<IdPayload> {
    const statement = await this.statementService.readById(systemId, statementId);

    if (!statement) {
      return new IdPayload(statementId);
    }

    const { createdByUserId } = statement;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot delete a statement unless you created it.');
    }

    await this.statementService.delete(statement);

    return new IdPayload(statementId);
  }

  @Get()
  getStatements(@ObjectIdDecorator('systemId') systemId: ObjectId, @Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.statementService.readStatements(systemId, page, count, keywords);
  }

  @Get(':statementId')
  async getById(@ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('statementId') statementId: ObjectId): Promise<StatementPayload> {
    const statement = await this.statementService.readById(systemId, statementId);

    if (!statement) {
      throw new NotFoundException('Statement not found.');
    }

    return new StatementPayload(statement);
  }

  @UseGuards(JwtGuard)
  @Patch(':statementId')
  async patchStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('statementId') statementId: ObjectId, @Body(ValidationPipe) editStatementPayload: EditStatementPayload): Promise<IdPayload> {
    const statement = await this.statementService.readById(systemId, statementId);

    if (!statement) {
      throw new NotFoundException('Statement not found.');
    }

    const { createdByUserId } = statement;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('You cannot update a statement unless you created it.');
    }

    await this.statementService.update(statement, editStatementPayload);

    return new IdPayload(statementId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(new ValidationPipe({ transform: true })) newStatementPayload: NewStatementPayload): Promise<void> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Statements cannot be added to formal systems that do not exist.');
    }

    const { createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new ForbiddenException('Statements cannot be added to formal systems unless you created them.');
    }

    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    const symbolIds = assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions);

    const symbols = await this.symbolService.readByIds(systemId, symbolIds);
    const symbolDictionary = symbols.reduce((dictionary: Record<string, SymbolEntity>, symbol: SymbolEntity): Record<string, SymbolEntity> => {
      const { _id } = symbol;

      const id = _id.toString();

      if (!dictionary[id]) {
        dictionary[id] = symbol;
      }

      return dictionary;
    }, {});

    symbolIds.forEach((symbolId: ObjectId): void => {
      if (!symbolDictionary[symbolId.toString()]) {
        throw new BadRequestException([
          'All symbols used in a statement must exist in the formal system.'
        ]);
      }
    });

    distinctVariableRestrictions.forEach((distinctVariableRestriction: [ObjectId, ObjectId]): void => {
      if (symbolDictionary[distinctVariableRestriction[0].toString()].type !== SymbolType.Variable || symbolDictionary[distinctVariableRestriction[1].toString()].type !== SymbolType.Variable) {
        throw new BadRequestException([
          'all distinct variable restrictions must be a pair of variable symbols'
        ]);
      }
    });

    const types = variableTypeHypotheses.reduce((types: Record<string, string>, variableTypeHypothesis: [ObjectId, ObjectId]): Record<string, string> => {
      const constant = variableTypeHypothesis[0].toString();
      const variable = variableTypeHypothesis[1].toString();

      if (symbolDictionary[constant].type !== SymbolType.Constant || symbolDictionary[variable].type !== SymbolType.Variable) {
        throw new BadRequestException([
          'all variable type hypotheses must start with a constant symbol and end with a variable symbol'
        ]);
      }

      types[variable] = constant;

      return types;
    }, {});

    [...logicalHypotheses, assertion].forEach((expression: ObjectId[]): void => {
      if (symbolDictionary[expression[0].toString()].type !== SymbolType.Constant) {
        throw new BadRequestException([
          'all logical hypotheses and the assertion must start with a constant symbol'
        ]);
      }

      expression.forEach((symbolId: ObjectId): void => {
        const id = symbolId.toString();

        if (symbolDictionary[id].type === SymbolType.Variable && !types[id]) {
          throw new BadRequestException([
            'all variable symbols in any logical hypothesis or the assertion must have a corresponding variable type hypothesis'
          ]);
        }
      });
    });

    await this.statementService.create(newStatementPayload, systemId, sessionUserId);
  }
};
