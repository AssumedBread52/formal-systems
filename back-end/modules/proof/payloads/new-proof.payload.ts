import { IsProofStepListDecorator } from '@/common/decorators/is-proof-step-list.decorator';
import { IsNotEmpty } from 'class-validator';

export class NewProofPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @IsProofStepListDecorator()
  steps: [string, [string, string[]][]][] = [];
};
