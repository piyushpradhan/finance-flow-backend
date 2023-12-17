import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Transaction } from './transaction.schema';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ required: true })
  name: string;
  @Prop()
  icon: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' })
  transactions: Transaction[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  subCategories: Category[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
