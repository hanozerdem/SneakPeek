import { Document, Types } from 'mongoose';
import { OrderStatus } from '../interfaces/order.interface';
export type OrderDocument = Order & Document & {
    _id: Types.ObjectId;
};
export declare class Order {
    userId: string;
    address: string;
    total: number;
    items: {
        productId: string;
        quantity: number;
    }[];
    status: OrderStatus;
    createdAt: Date;
    deliveredAt?: Date;
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
