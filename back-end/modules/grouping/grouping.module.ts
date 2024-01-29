import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupingController } from './grouping.controller';
import { GroupingEntity } from './grouping.entity';
import { GroupingService } from './grouping.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupingEntity
    ])
  ],
  controllers: [
    GroupingController
  ],
  providers: [
    GroupingService
  ]
})
export class GroupingModule {
};
