import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  //@Prop({ required: true })
  //createdAt: string;

  @Prop({ required: true })
  subTotal: number;

  @Prop({ required: true })
  taxRate: number;

  @Prop({ required: true })
  shippingFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  companyAddress: string;

  @Prop({ required: true })
  paymentMethodEncrypted: string;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop({ required: true })
  creditCardMasked: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({
    type: [
      {
        productId: Number,
        quantity: Number,
        price: Number,
        productName: String,
      },
    ],
    required: true,
  })
  items: {
    productId: number;
    quantity: number;
    price: number;
    productName: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type InvoiceDocument = Invoice & Document;
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);