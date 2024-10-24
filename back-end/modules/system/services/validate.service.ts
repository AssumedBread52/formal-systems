import { BaseValidateService } from '@/common/services/base-validate.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidateService extends BaseValidateService {
  async conflictCheck(): Promise<void> {
  }
};
