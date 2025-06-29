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
    sizes?: ProductSizeInput[];
    prices?: ProductPricingInput[];
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
    sizes?: ProductSize[];
    prices?: ProductPricing[];
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
    sizes?: ProductSizeInput[];
    prices?: ProductPricingInput[];
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
export interface ProductSizeInput {
    size: string;
    quantity: number;
}
export interface ProductPricingInput {
    priceType: string;
    price: number;
    currency: string;
}
export interface AddSizeToProductRequest {
    productId: number;
    size: string;
    quantity: number;
}
export interface AddSizeToProductResponse {
    status: boolean;
    message: string;
    newTotalStock: number;
}
export interface AddPriceToProductRequest {
    productId: number;
    priceType: string;
    price: number;
    currency: string;
}
export interface AddPriceToProductResponse {
    status: boolean;
    message: string;
}
export interface IsProductAvailableInSizeRequest {
    productId: number;
    size: string;
}
export interface IsProductAvailableInSizeResponse {
    status: boolean;
    available: boolean;
    message: string;
}
export interface GetProductStockRequest {
    productId: number;
}
export interface GetProductStockResponse {
    status: boolean;
    message: string;
    stock: number;
}
export interface CheckStockBeforeAddingRequest {
    productId: number;
    quantity: number;
}
export interface CheckStockBeforeAddingResponse {
    status: boolean;
    message: string;
}
export interface DecreaseStockAfterPurchaseRequest {
    productId: number;
    quantity: number;
}
export interface DecreaseStockAfterPurchaseResponse {
    status: boolean;
    message: string;
}
export interface ProductBaseService {
    CreateProduct(data: CreateProductRequest): Observable<CreateProductResponse>;
    GetAllProducts(data: GetAllProductsRequest): Observable<GetAllProductsResponse>;
    GetProductById(data: GetProductByIdRequest): Observable<GetProductByIdResponse>;
    UpdateProduct(data: UpdateProductRequest): Observable<UpdateProductResponse>;
    DeleteProduct(data: DeleteProductRequest): Observable<DeleteProductResponse>;
    AddSizeToProduct(data: AddSizeToProductRequest): Observable<AddSizeToProductResponse>;
    AddPriceToProduct(data: AddPriceToProductRequest): Observable<AddPriceToProductResponse>;
    IsProductAvailableInSize(data: IsProductAvailableInSizeRequest): Observable<IsProductAvailableInSizeResponse>;
    GetProductStock(data: GetProductStockRequest): Observable<GetProductStockResponse>;
    CheckStockBeforeAdding(data: CheckStockBeforeAddingRequest): Observable<CheckStockBeforeAddingResponse>;
    DecreaseStockAfterPurchase(data: DecreaseStockAfterPurchaseRequest): Observable<DecreaseStockAfterPurchaseResponse>;
}
export interface Review {
    reviewId: number;
    userId: number;
    reviewText?: string;
    rating: number;
    createdAt: string;
}
