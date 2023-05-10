import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormalSystem, FormalSystemDocument } from './formal-system.schema';

@Injectable()
export class FormalSystemService {
  constructor(@InjectModel(FormalSystem.name) private formalSystemModel: Model<FormalSystemDocument>) {
  }

  buildUrlPath(title: string) {
    return title.split(' ').join('-').toLowerCase();
  }

  create(formalSystem: FormalSystem): Promise<FormalSystemDocument> {
    const newFormalSystem = new this.formalSystemModel(formalSystem);

    return newFormalSystem.save();
  }
};
