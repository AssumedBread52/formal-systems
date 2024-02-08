import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';
import { Body, Controller, Get, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { StatementService } from './statement.service';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementService: StatementService) {
  }

  @Get()
  getSystems(@Query('page', ParseIntPipe) page: number, @Query('count', ParseIntPipe) count: number, @Query('keywords') keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    return this.statementService.readStatements(page, count, keywords);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newStatementPayload: NewStatementPayload): Promise<void> {
    await this.statementService.create(newStatementPayload, systemId, sessionUserId);
  }
};
