import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/hypothesis')
export class HypothesisController {
  public constructor(private readonly hypothesisReadService: HypothesisReadService) {
  }

  @Get(':hypothesisId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisReadService.selectById(systemId, statementId, hypothesisId);
  }
};
