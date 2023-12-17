import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Account } from './account.schema';
import { Category } from './category.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ required: true })
  timestamp: Date;
  @Prop({ required: true })
  amount: number;
  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  })
  user: User;
  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
  })
  account: Account;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  category: Category;
  @Prop()
  note: string;
  @Prop({ required: true })
  type: 'income' | 'expense' | 'transfer' | 'debt' | 'receivable';
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
