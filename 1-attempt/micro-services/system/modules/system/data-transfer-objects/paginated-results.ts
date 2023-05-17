import { SystemDocument } from '@/system/system.schema';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { ClientSystem } from './client-system';

export class PaginatedResults {
  @IsPositive()
  @IsInt()
  total: number;
  @IsArray()
  @ValidateNested({
    each: true
  })
  @Type(() => ClientSystem)
  results: ClientSystem[];

  constructor(total: number, systemDocuments: SystemDocument[]) {
    this.total = total;
    this.results = systemDocuments.map((systemDocument: SystemDocument): ClientSystem => {
      return new ClientSystem(systemDocument);
    });
  }
};
