import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { NewExpressionPayload } from '@/expression/payloads/new-expression.payload';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { ExpressionWriteService } from '@/expression/services/expression-write.service';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';

@Controller('system/:systemId/expression')
export class ExpressionController {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly expressionWriteService: ExpressionWriteService) {
  }

  @Delete(':expressionId')
  @UseGuards(JwtGuard)
  public deleteExpression(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('expressionId', new ParseUUIDPipe()) expressionId: string): Promise<ExpressionEntity> {
    return this.expressionWriteService.delete(sessionUserId, systemId, expressionId);
  }

  @Get()
  public getExpressions(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Query() searchExpressionsPayload: SearchExpressionsPayload): Promise<PaginatedExpressionsPayload> {
    return this.expressionReadService.searchExpressions(systemId, searchExpressionsPayload);
  }

  @Get(':expressionId')
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('expressionId', new ParseUUIDPipe()) expressionId: string): Promise<ExpressionEntity> {
    return this.expressionReadService.selectById(systemId, expressionId);
  }

  @Post()
  @UseGuards(JwtGuard)
  public postExpression(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Body() newExpressionPayload: NewExpressionPayload): Promise<ExpressionEntity> {
    return this.expressionWriteService.create(sessionUserId, systemId, newExpressionPayload);
  }
};
