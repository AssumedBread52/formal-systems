import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, SerializeOptions, UseInterceptors } from '@nestjs/common';

@Controller('system/:systemId/expression')
@SerializeOptions({
  excludePrefixes: [
    '__'
  ]
})
export class ExpressionController {
  public constructor(private readonly expressionReadService: ExpressionReadService) {
  }

  @Get(':expressionId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('expressionId', new ParseUUIDPipe()) expressionId: string): Promise<ExpressionEntity> {
    return this.expressionReadService.selectById(systemId, expressionId);
  }
};
