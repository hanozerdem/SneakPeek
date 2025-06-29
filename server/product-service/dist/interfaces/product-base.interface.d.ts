import { Observable } from "rxjs";
export interface CreateProductRequest {
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
export interface CreateProductResponse {
    status: boolean;
    message: string;
    productId?: number;
}
export interface GetAllProductsRequest {
}
export interface GetAllProductsResponse {
    status: boolean;
    message: string;
    products: Product[];
}
export interface Product {
    productId: number;
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
    sizes?: ProductSize[];
    prices?: ProductPricing[];
    reviews?: Review[];
    rating?: number;
}
export interface ProductSize {
    sizeId: number;
    size: string;
    quantity: number;
}
export interface ProductPricing {
    pricingId: number;
    priceType: string;
    price: number;
    currency: string;
}
export interface Review {
    reviewId: number;
    userId: number;
    reviewText?: string;
    rating: number;
    createdAt: string;
}
export interface GetProductByIdRequest {
    productId: number;
}
export interface GetProductByIdResponse {
    status: boolean;
    message: string;
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
export interface UpdateProductRequest {
    productId: number;
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
export interface UpdateProductResponse {
    status: boolean;
    message: string;
}
export interface DeleteProductRequest {
    productId: number;
}
export interface DeleteProductResponse {
    status: boolean;
    message: string;
}
export interface ProductBaseService {
    CreateProduct(data: CreateProductRequest): Observable<CreateProductResponse>;
    GetAllProducts(data: GetAllProductsRequest): Observable<GetAllProductsResponse>;
    GetProductById(data: GetProductByIdRequest): Observable<GetProductByIdResponse>;
    UpdateProduct(data: UpdateProductRequest): Observable<UpdateProductResponse>;
    DeleteProduct(data: DeleteProductRequest): Observable<DeleteProductResponse>;
}
