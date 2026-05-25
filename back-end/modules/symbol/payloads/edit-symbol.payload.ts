import { InputType, PartialType } from '@nestjs/graphql';
import { NewSymbolPayload } from './new-symbol.payload';

@InputType()
export class EditSymbolPayload extends PartialType(NewSymbolPayload) {
};
