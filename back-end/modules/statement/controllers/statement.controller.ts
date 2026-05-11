import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';

@Controller('system/:systemId/statement')
export class StatementController {
  public constructor(private readonly statementReadService: StatementReadService) {
  }

  @Get(':statementId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }
};
