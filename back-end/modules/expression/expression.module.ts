import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressionController } from './controllers/expression.controller';
import { MongoExpressionEntity } from './entities/mongo-expression.entity';
import { ExpressionRepository } from './repositories/expression.repository';
import { ExpressionResolver } from './resolvers/expression.resolver';
import { ExpressionReadService } from './services/expression-read.service';
import { ExpressionWriteService } from './services/expression-write.service';

@Module({
  imports: [
    SymbolModule,
    SystemModule,
    TypeOrmModule.forFeature([
      MongoExpressionEntity
    ]),
    UserModule
  ],
  controllers: [
    ExpressionController
  ],
  providers: [
    ExpressionReadService,
    ExpressionRepository,
    ExpressionResolver,
    ExpressionWriteService
  ]
})
export class ExpressionModule {
};
