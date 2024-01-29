import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupingEntity } from './grouping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupingEntity
    ])
  ]
})
export class GroupingModule {
};
