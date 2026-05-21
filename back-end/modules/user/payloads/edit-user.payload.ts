import { InputType, PartialType } from '@nestjs/graphql';
import { NewUserPayload } from './new-user.payload';

@InputType()
export class EditUserPayload extends PartialType(NewUserPayload) {
};
