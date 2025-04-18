import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { StatementPayload } from './payloads/statement.payload';
import { StatementCreateService } from './services/statement-create.service';
import { StatementDeleteService } from './services/statement-delete.service';
import { StatementReadService } from './services/statement-read.service';
import { StatementUpdateService } from './services/statement-update.service';
import { StatementEntity } from './statement.entity';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementCreateService: StatementCreateService, private statementDeleteService: StatementDeleteService, private statementReadService: StatementReadService, private statementUpdateService: StatementUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':statementId')
  async deleteStatement(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string): Promise<StatementPayload> {
    const deletedStatement = await this.statementDeleteService.delete(sessionUserId, systemId, statementId);

    return new StatementPayload(deletedStatement);
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
  async patchStatement(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string, @Body() payload: any): Promise<StatementPayload> {
    const updatedStatement = await this.statementUpdateService.update(sessionUserId, systemId, statementId, payload);

    return new StatementPayload(updatedStatement);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUserDecorator('id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Body() payload: any): Promise<StatementPayload> {
    const createdStatement = await this.statementCreateService.create(sessionUserId, systemId, payload);

    return new StatementPayload(createdStatement);
  }
};
