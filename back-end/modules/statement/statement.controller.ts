import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { IdPayload } from '@/common/payloads/id.payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { StatementNotFoundException } from './exceptions/statement-not-found.exception';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { StatementPayload } from './payloads/statement.payload';
import { StatementCreateService } from './services/statement-create.service';
import { StatementDeleteService } from './services/statement-delete.service';
import { StatementReadService } from './services/statement-read.service';
import { StatementEntity } from './statement.entity';
import { StatementService } from './statement.service';
import { isMongoId } from 'class-validator';
import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementCreateService: StatementCreateService, private statementDeleteService: StatementDeleteService, private statementReadService: StatementReadService, private statementService: StatementService, private symbolReadService: SymbolReadService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':statementId')
  async deleteStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string): Promise<StatementPayload> {
    const statement = await this.statementDeleteService.delete(sessionUserId, systemId, statementId);

    return new StatementPayload(statement);
  }

  @Get()
  async getStatements(@Param('systemId') systemId: string, @Query() payload: any): Promise<PaginatedResultsPayload<StatementEntity, StatementPayload>> {
    const [results, total] = await this.statementReadService.readStatements(systemId, payload);

    return new PaginatedResultsPayload(StatementPayload, results, total);
  }

  @Get(':statementId')
  async getById(@Param('systemId') systemId: string, @Param('statementId') statementId: string): Promise<StatementPayload> {
    const statement = await this.statementReadService.readById(systemId, statementId);

    return new StatementPayload(statement);
  }

  @UseGuards(JwtGuard)
  @Patch(':statementId')
  async patchStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string, @Body(new ValidationPipe({ transform: true })) editStatementPayload: EditStatementPayload): Promise<IdPayload> {
    if (!isMongoId(systemId) || !isMongoId(statementId)) {
      throw new InvalidObjectIdException();
    }

    const statement = await this.statementService.readById(new ObjectId(systemId), new ObjectId(statementId));

    if (!statement) {
      throw new StatementNotFoundException();
    }

    const { createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const { newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    const symbolIds = newAssertion.concat(...newDistinctVariableRestrictions, ...newVariableTypeHypotheses, ...newLogicalHypotheses);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(new ObjectId(systemId), symbolIds, {});

    await this.statementService.update(statement, editStatementPayload, symbolDictionary);

    return new IdPayload(new ObjectId(statementId));
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<StatementPayload> {
    const createdStatement = await this.statementCreateService.create(sessionUserId, systemId, payload);

    return new StatementPayload(createdStatement);
  }
};
