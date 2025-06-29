import { Product } from './product.entity';
export declare class Review {
    reviewID: number;
    userID: number;
    reviewText: string;
    rating: number;
    createdAt: Date;
    product: Product;
}
