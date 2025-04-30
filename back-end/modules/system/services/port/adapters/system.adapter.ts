import { SystemEntity } from '@/system/entities/system.entity';

export abstract class SystemAdapter {
  abstract readById(systemIdPayload: any): Promise<SystemEntity | null>;
  abstract readSystems(searchPayload: any): Promise<[SystemEntity[], number]>;
};
