import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['customer', 'sales_manager', 'product_manager'] })
  role: string;

  @Prop({ type: [Number], default: [] })
  wishlist: number[];  // Product ID's

  @Prop({ type: [Number], default: [] })
  cart: number[];
}

export const UserSchema = SchemaFactory.createForClass(User);
