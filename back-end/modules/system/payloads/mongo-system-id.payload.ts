import { IsMongoId } from 'class-validator';

export class MongoSystemIdPayload {
  @IsMongoId()
  systemId: string = '';
};
