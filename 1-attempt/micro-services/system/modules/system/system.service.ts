import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UpdateSystemPayload } from './data-transfer-objects';
import { System, SystemDocument } from './system.schema';

@Injectable()
export class SystemService {
  constructor(@InjectModel(System.name) private systemModel: Model<SystemDocument>) {
  }

  buildSearchFilter(keywords: string | string[]): FilterQuery<SystemDocument> {
    return {
      $text: {
        $caseSensitive: false,
        $search: Array.isArray(keywords) ? keywords.join(',') : keywords
      }
    };
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

  readTotalCountByKeywords(keywords?: string | string[]): Promise<number> {
    if (!keywords || 0 === keywords.length) {
      return this.systemModel.countDocuments().exec();
    }

    const filter = this.buildSearchFilter(keywords);

    return this.systemModel.countDocuments(filter).exec();
  }

  readPaginatedByKeywords(page: number, count: number, keywords?: string | string[]): Promise<SystemDocument[]> {
    const skip = (page - 1) * count;

    if (!keywords || 0 === keywords.length) {
      return this.systemModel.find().skip(skip).limit(count).exec();
    }

    const filter = this.buildSearchFilter(keywords);

    return this.systemModel.find(filter).skip(skip).limit(count).exec();
  }

  readById(id: string): Promise<SystemDocument | null> {
    return this.systemModel.findById(id).exec();
  }

  readByUrlPath(urlPath: string): Promise<SystemDocument | null> {
    return this.systemModel.findOne({
      urlPath: encodeURIComponent(urlPath)
    }).exec();
  }

  async update(system: SystemDocument, updateSystemPayload: UpdateSystemPayload): Promise<void> {
    const { title, description } = updateSystemPayload;
    const { urlPath } = system;

    const newUrlPath = encodeURIComponent(title);

    if (newUrlPath !== urlPath) {
      await this.checkForConflict(newUrlPath);
    }

    system.title = title;
    system.urlPath = newUrlPath;
    system.description = description;

    system.save();
  }

  delete(id: string): Promise<SystemDocument | null> {
    return this.systemModel.findByIdAndDelete(id).exec();
  }
};
