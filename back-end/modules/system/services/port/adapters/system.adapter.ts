import { SystemEntity } from '@/system/entities/system.entity';

export abstract class SystemAdapter {
  abstract readById(systemIdPayload: any): Promise<SystemEntity | null>;
  abstract readConflict(conflictPayload: any): Promise<boolean>;
  abstract readSystems(searchPayload: any): Promise<[SystemEntity[], number]>;
  abstract update(system: any, editSystemPayload: any): Promise<SystemEntity>;
  abstract delete(system: any): Promise<SystemEntity>;
};
