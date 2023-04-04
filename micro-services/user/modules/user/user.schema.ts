import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
  @Prop()
  firstName: string = '';
  @Prop()
  lastName: string = '';
  @Prop()
  email: string = '';
  @Prop()
  hashedPassword: string = '';
};

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
