import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  versionKey: false
})
export class FormalSystem {
  @Prop()
  title: string = '';
  @Prop()
  urlPath: string = '';
  @Prop()
  description: string = '';
  @Prop()
  createdByUserId: string = '';
};

export const FormalSystemSchema = SchemaFactory.createForClass(FormalSystem);

export type FormalSystemDocument = HydratedDocument<FormalSystem>;
