import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { NewHypothesisPayload } from '@/statement/payloads/new-hypothesis.payload';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { HypothesisWriteService } from '@/statement/services/hypothesis-write.service';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/hypothesis')
export class HypothesisController {
  public constructor(private readonly hypothesisReadService: HypothesisReadService, private readonly hypothesisWriteService: HypothesisWriteService) {
  }

  @Delete(':hypothesisId')
  @UseGuards(JwtGuard)
  public deleteHypothesis(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisWriteService.delete(sessionUserId, systemId, statementId, hypothesisId);
  }

  @Get()
  public getHypotheses(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Query() searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    return this.hypothesisReadService.searchHypotheses(systemId, statementId, searchHypothesesPayload);
  }

  @Get(':hypothesisId')
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisReadService.selectById(systemId, statementId, hypothesisId);
  }

  @Post()
  @UseGuards(JwtGuard)
  public postHypothesis(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Body() newHypothesisPayload: NewHypothesisPayload): Promise<HypothesisEntity> {
    return this.hypothesisWriteService.create(sessionUserId, systemId, statementId, newHypothesisPayload);
  }
};
