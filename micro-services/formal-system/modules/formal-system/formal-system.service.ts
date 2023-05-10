import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormalSystem, FormalSystemDocument } from './formal-system.schema';

@Injectable()
export class FormalSystemService {
  constructor(@InjectModel(FormalSystem.name) private formalSystemModel: Model<FormalSystemDocument>) {
  }

  async checkForConflict(urlPath: string): Promise<void> {
    const collision = await this.readByUrlPath(urlPath);

    if (collision) {
      throw new ConflictException();
    }
  }

  async create(formalSystem: FormalSystem): Promise<FormalSystemDocument> {
    const { urlPath } = formalSystem;

    await this.checkForConflict(urlPath);

    const newFormalSystem = new this.formalSystemModel(formalSystem);

    return newFormalSystem.save();
  }

  readByUrlPath(urlPath: string): Promise<FormalSystemDocument | null> {
    return this.formalSystemModel.findOne({
      urlPath
    }).exec();
  }
};
