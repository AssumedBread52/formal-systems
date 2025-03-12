import { Module } from '@nestjs/common';
import { PayloadValidationService } from './services/payload-validation.service';

@Module({
  providers: [
    PayloadValidationService
  ],
  exports: [
    PayloadValidationService
  ]
})
export class CommonModule {
};
