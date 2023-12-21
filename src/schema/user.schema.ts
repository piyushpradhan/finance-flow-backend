import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Account } from './account.schema';

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
