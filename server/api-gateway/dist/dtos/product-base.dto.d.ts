export declare class CreateProductDto {
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
}
export declare class UpdateProductDto {
    productName?: string;
    model?: string;
    brand?: string;
    serialNumber?: string;
    price?: number;
    currency?: string;
    warrantyStatus?: string;
    distributor?: string;
    description?: string;
    color?: string;
    category?: string;
    tags?: string[];
}
export declare class CreateReviewDto {
    productId: number;
    reviewText: string;
    rating: number;
}
