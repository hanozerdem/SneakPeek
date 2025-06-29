import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../interfaces/order.interface';

export type OrderDocument = Order & Document & {
  _id: Types.ObjectId;
};

@Schema()
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true, type: Array })
  items: { productId: string; quantity: number; size: string}[];

  @Prop({ enum: OrderStatus, default: OrderStatus.PROCESSING })
  status: OrderStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop() 
  deliveredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
