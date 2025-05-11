import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  emailConfirmed: boolean;

  @Prop({ required: false, type: String })
  authenticatorKey: string | null = null;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ required: true })
  securityStamp: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop()
  recoveryCodes: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
