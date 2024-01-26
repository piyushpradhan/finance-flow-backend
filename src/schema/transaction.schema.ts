import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  timestamp: string;
  @Prop({ required: true })
  amount: number;
  @Prop({ required: true })
  user: string;
  @Prop({ required: true })
  account: string;
  @Prop({ required: true })
  category: string;
  @Prop()
  note: string;
  @Prop({ required: true })
  type: 'income' | 'expense' | 'transfer' | 'debt' | 'receivable';
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.post(
  ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'],
  function (res) {
    if (!this._mongooseOptions.lean) {
      return;
    }

    function transformDoc(doc) {
      if (doc) {
        delete doc._id;
        delete doc.__v;
        return doc;
      }
    }

    if (Array.isArray(res)) {
      return res.map(transformDoc);
    }

    return transformDoc(res);
  },
);
