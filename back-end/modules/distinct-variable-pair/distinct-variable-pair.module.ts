import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistinctVariablePairController } from './controllers/distinct-variable-pair.controller';
import { MongoDistinctVariablePairEntity } from './entities/mongo-distinct-variable-pair.entity';
import { DistinctVariablePairRepository } from './repositories/distinct-variable-pair.repository';
import { DistinctVariablePairResolver } from './resolvers/distinct-variable-pair.resolver';
import { DistinctVariablePairReadService } from './services/distinct-variable-pair-read.service';
import { DistinctVariablePairWriteService } from './services/distinct-variable-pair-write.service';

@Module({
  imports: [
    SymbolModule,
    SystemModule,
    TypeOrmModule.forFeature([
      MongoDistinctVariablePairEntity
    ]),
    UserModule
  ],
  controllers: [
    DistinctVariablePairController
  ],
  providers: [
    DistinctVariablePairReadService,
    DistinctVariablePairRepository,
    DistinctVariablePairResolver,
    DistinctVariablePairWriteService
  ]
})
export class DistinctVariablePairModule {
};
