import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { StatementService } from './statement.service';
import { ObjectIdDecorator } from '@/common/decorators/object-id.decorator';

@Controller('system/:systemId/statement')
export class StatementController {
  constructor(private statementService: StatementService) {
  }

  @UseGuards(JwtGuard)
  @Post()
  async postStatement(@SessionUserDecorator('_id') sessionUserId: ObjectId, @ObjectIdDecorator('systemId') systemId: ObjectId, @Body(ValidationPipe) newStatementPayload: NewStatementPayload): Promise<void> {
    await this.statementService.create(newStatementPayload, systemId, sessionUserId);
  }
};
