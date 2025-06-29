import { ProductSize } from './product-size.entity';
import { ProductPricing } from './product-pricing.entity';
import { Review } from './review.entity';
export declare class Product {
    productID: number;
    productName: string;
    model: string;
    brand: string;
    serialNumber: string;
    price: number;
    currency: string;
    warrantyStatus: string;
    distributor: string;
    description?: string;
    color?: string;
    category?: string;
    tags?: string[];
    sizes: ProductSize[];
    prices: ProductPricing[];
    reviews: Review[];
    rating: number;
    get totalStock(): number;
}
