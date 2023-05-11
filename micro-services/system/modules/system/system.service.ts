import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { System, SystemDocument } from './system.schema';

@Injectable()
export class SystemService {
  constructor(@InjectModel(System.name) private systemModel: Model<SystemDocument>) {
  }

  async checkForConflict(urlPath: string): Promise<void> {
    const collision = await this.readByUrlPath(urlPath);

    if (collision) {
      throw new ConflictException();
    }
  }

  async create(system: System): Promise<SystemDocument> {
    const { urlPath } = system;

    await this.checkForConflict(urlPath);

    const newSystem = new this.systemModel(system);

    return newSystem.save();
  }

  readByUrlPath(urlPath: string): Promise<SystemDocument | null> {
    return this.systemModel.findOne({
      urlPath
    }).exec();
  }
};
