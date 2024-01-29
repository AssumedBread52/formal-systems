import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupingController } from './grouping.controller';
import { GroupingEntity } from './grouping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupingEntity
    ])
  ],
  controllers: [
    GroupingController
  ]
})
export class GroupingModule {
};
