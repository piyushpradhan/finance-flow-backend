import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transaction } from './transaction.schema';
import mongoose, { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop({ required: true })
  name: string;
  @Prop()
  description: string;
  @Prop({ required: true, default: 0 })
  balance: number;
  @Prop({ required: true, default: 'cash' })
  category: 'debit' | 'credit' | 'cash';
  @Prop({
    defualt: [],
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  })
  transactions: Transaction[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
