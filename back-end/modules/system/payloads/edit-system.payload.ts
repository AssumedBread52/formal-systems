import { InputType, PartialType } from '@nestjs/graphql';
import { NewSystemPayload } from './new-system.payload';

@InputType()
export class EditSystemPayload extends PartialType(NewSystemPayload) {
};
