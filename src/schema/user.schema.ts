import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Account } from './account.schema';
import { Category } from './category.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  uid: string;
  @Prop()
  displayPicture?: string;
  @Prop({ required: true })
  username: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  currency: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }] })
  accounts: Account[];
  @Prop()
  sessionToken: string;
  @Prop()
  facebookId: string;
  @Prop()
  googleId: string;
  @Prop()
  appleId: string;
  @Prop()
  password: string;
  @Prop({ default: [], type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  categories: Category[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  const user: User = this as any;

  if (!user.password || user.password.startsWith('$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt();

    user.password = await bcrypt.hash(user.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (res) {
  if (!this._mongooseOptions.lean) {
    return;
  }

  function transformDoc(doc) {
    if (doc) {
      doc.uid = doc._id;
      delete doc._id;
      delete doc.__v;
      return doc;
    }
  }

  if (Array.isArray(res)) {
    return res.map(transformDoc);
  }

  return transformDoc(res);
});
