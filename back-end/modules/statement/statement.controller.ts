import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { IdPayload } from '@/common/payloads/id.payload';
import { SystemService } from '@/system/system.service';
import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { StatementService } from './statement.service';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementService: StatementService, private systemService: SystemService) {
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
  async postStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newStatementPayload: NewStatementPayload): Promise<void> {
    const system = await this.systemService.readById(systemId);

    if (!system) {
      throw new NotFoundException('Statements cannot be added to formal systems that do not exist.');
    }

    const { createdByUserId } = system;

    if (sessionUserId.toString() !== createdByUserId.toString()) {
      throw new ForbiddenException('Statements cannot be added to formal systems unless you created them.');
    }

    await this.statementService.create(newStatementPayload, systemId, sessionUserId);
  }
};
