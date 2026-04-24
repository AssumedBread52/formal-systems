import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, Query, SerializeOptions, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/expression')
@SerializeOptions({
  excludePrefixes: [
    '__'
  ]
})
export class ExpressionController {
  public constructor(private readonly expressionReadService: ExpressionReadService) {
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getExpressions(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Query(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchExpressionsPayload: SearchExpressionsPayload): Promise<PaginatedExpressionsPayload> {
    return this.expressionReadService.searchExpressions(systemId, searchExpressionsPayload);
  }

  @Get(':expressionId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('expressionId', new ParseUUIDPipe()) expressionId: string): Promise<ExpressionEntity> {
    return this.expressionReadService.selectById(systemId, expressionId);
  }
};
