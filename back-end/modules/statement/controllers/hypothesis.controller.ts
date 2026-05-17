import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { HypothesisWriteService } from '@/statement/services/hypothesis-write.service';
import { ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/hypothesis')
export class HypothesisController {
  public constructor(private readonly hypothesisReadService: HypothesisReadService, private readonly hypothesisWriteService: HypothesisWriteService) {
  }

  @Delete(':hypothesisId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public deleteHypothesis(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisWriteService.delete(sessionUserId, systemId, statementId, hypothesisId);
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
