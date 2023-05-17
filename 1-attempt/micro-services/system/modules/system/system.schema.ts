import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  versionKey: false
})
export class System {
  @Prop()
  title: string = '';
  @Prop()
  urlPath: string = '';
  @Prop()
  description: string = '';
  @Prop()
  createdByUserId: string = '';
};

export const SystemSchema = SchemaFactory.createForClass(System);

export type SystemDocument = HydratedDocument<System>;
