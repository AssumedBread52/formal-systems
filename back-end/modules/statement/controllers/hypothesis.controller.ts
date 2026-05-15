import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/hypothesis')
export class HypothesisController {
  public constructor(private readonly hypothesisReadService: HypothesisReadService) {
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getHypotheses(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Query(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    return this.hypothesisReadService.searchHypotheses(systemId, statementId, searchHypothesesPayload);
  }

  @Get(':hypothesisId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisReadService.selectById(systemId, statementId, hypothesisId);
  }
};
