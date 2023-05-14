import { SystemDocument } from '@/system/system.schema';
import { IsNotEmpty } from 'class-validator';

export class ClientSystem {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  urlPath: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  createdByUserId: string;

  constructor(systemDocument: SystemDocument) {
    const { _id, title, urlPath, description, createdByUserId } = systemDocument;

    this.id = _id.toString();
    this.title = title;
    this.urlPath = urlPath;
    this.description = description;
    this.createdByUserId = createdByUserId;
  }
};
