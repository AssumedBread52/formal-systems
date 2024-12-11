import { IsProofStepListDecorator } from '@/common/decorators/is-proof-step-list.decorator';
import { IsNotEmpty } from 'class-validator';

export class EditProofPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  @IsProofStepListDecorator()
  newSteps: [string, [string, string[]][]][] = [];
};
