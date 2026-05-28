import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { NewStatementPayload } from './new-statement.payload';

@InputType()
export class EditStatementPayload extends OmitType(PartialType(NewStatementPayload), [
  'typeHypothesesExpressionIds'
]) {
};
