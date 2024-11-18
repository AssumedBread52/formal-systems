import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { StatementNotFoundException } from './exceptions/statement-not-found.exception';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { SearchPayload } from './payloads/search.payload';
import { StatementPayload } from './payloads/statement.payload';
import { StatementCreateService } from './services/statement-create.service';
import { StatementEntity } from './statement.entity';
import { StatementService } from './statement.service';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementCreateService: StatementCreateService, private statementService: StatementService, private symbolReadService: SymbolReadService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':statementId')
  async deleteStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('statementId') statementId: ObjectId): Promise<IdPayload> {
    const statement = await this.statementService.readById(systemId, statementId);

    if (!statement) {
      return new IdPayload(statementId);
    }

    const { createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    await this.statementService.delete(statement);

    return new IdPayload(statementId);
  }

  @Get()
  async getStatements(@ObjectIdDecorator('systemId') systemId: ObjectId, @Query(new ValidationPipe({ transform: true })) searchPayload: SearchPayload): Promise<PaginatedResultsPayload<StatementEntity, StatementPayload>> {
    const { page, count, keywords } = searchPayload;

    const [results, total] = await this.statementService.readStatements(page, count, keywords, systemId);

    return new PaginatedResultsPayload(StatementPayload, results, total);
  }

  @Get(':statementId')
  async getById(@ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('statementId') statementId: ObjectId): Promise<StatementPayload> {
    const statement = await this.statementService.readById(systemId, statementId);

    if (!statement) {
      throw new StatementNotFoundException();
    }

    return new StatementPayload(statement);
  }

  @UseGuards(JwtGuard)
  @Patch(':statementId')
  async patchStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @ObjectIdDecorator('statementId') statementId: ObjectId, @Body(new ValidationPipe({ transform: true })) editStatementPayload: EditStatementPayload): Promise<IdPayload> {
    const statement = await this.statementService.readById(systemId, statementId);

    if (!statement) {
      throw new StatementNotFoundException();
    }

    const { createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const { newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    const symbolIds = newAssertion.concat(...newDistinctVariableRestrictions, ...newVariableTypeHypotheses, ...newLogicalHypotheses);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds, {});

    await this.statementService.update(statement, editStatementPayload, symbolDictionary);

    return new IdPayload(statementId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<StatementPayload> {
    const createdStatement = await this.statementCreateService.create(sessionUserId, systemId, payload);

    return new StatementPayload(createdStatement);
  }
};
