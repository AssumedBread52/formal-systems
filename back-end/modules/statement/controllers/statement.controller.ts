import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

@Controller('system/:systemId/statement')
export class StatementController {
  public constructor(private readonly statementReadService: StatementReadService) {
  }

  @Get(':statementId')
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }
};
