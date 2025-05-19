import { SystemEntity } from '@/system/entities/system.entity';

export interface SystemRepository {
  create(newSystemPayload: any): Promise<SystemEntity>;
  readById(systemIdPayload: any): Promise<SystemEntity | null>;
  readConflictExists(conflictPayload: any): Promise<boolean>;
  readSystems(searchPayload: any): Promise<[SystemEntity[], number]>;
  update(system: any, editSystemPayload: any): Promise<SystemEntity>;
  delete(system: any): Promise<SystemEntity>;
};
