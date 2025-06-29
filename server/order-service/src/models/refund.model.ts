import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { RefundStatus } from "src/interfaces/order.interface";






@Schema({ timestamps: true })
export class Refund {

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @Prop()
  reviewedBy?: string;

  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
  
}

export type RefundDocument = Refund & Document;
export const RefundSchema = SchemaFactory.createForClass(Refund);
