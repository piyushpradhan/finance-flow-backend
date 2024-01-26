import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;
  @Prop()
  icon: string;
  @Prop({ required: true })
  transactions: string[];
  @Prop()
  subCategories: string[];
  @Prop({ required: true })
  uid: string;
  @Prop({ required: true, default: false })
  isSubcategory: false;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.post(
  [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'deleteOne',
    'updateMany',
  ],
  function (res) {
    if (!this._mongooseOptions.lean) {
      return;
    }

    function transformDoc(doc) {
      if (doc) {
        doc.id = doc._id;
        delete doc._id;
        delete doc.__v;
        return doc;
      }
    }

    if (Array.isArray(res)) {
      return res.map(transformDoc);
    }

    return transformDoc;
  },
);
