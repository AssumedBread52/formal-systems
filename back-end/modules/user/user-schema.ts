import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  fullName: string = '';
  @Prop()
  email: string = '';
  @Prop({
    select: false
  })
  hashedPassword: string = '';
};

export const UserSchema = SchemaFactory.createForClass(User);
