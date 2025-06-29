import { Observable } from "rxjs";

/* ------------------ CREATE ------------------ */
export interface CreateProductRequest {
    productName: string;
    model: string;
    brand: string;
    serialNumber: string;
    price?: number;
    currency?: string;
    warrantyStatus: string;
    distributor: string;
    description?: string;
    color?: string;
    category?: string;
    imageUrl?: string;
    tags?: string[];
    sizes?: ProductSizeInput[];     
    prices?: ProductPricingInput[];     
    currentPriceType?: string;
}


export interface CreateProductResponse {
    status: boolean;
    message: string;
    productId?: number;
}

/* ------------------ GET ------------------ */
export interface GetAllProductsRequest {}

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
    imageUrl?: string;
    tags?: string[];
    sizes?: ProductSize[];       // GetAllProductsResponse'ta dönecek detaylı size bilgileri.
    prices?: ProductPricing[];   // GetAllProductsResponse'ta dönecek detaylı fiyatlandırma bilgileri.
    reviews?: Review[];          // Yorumlar varsa.
    rating?: number;
    popularity?: number; // to be calculated by the number of purchases, sales, and reviews.etc.
    sales?: number; // to be inceased by the number of purchases.
    currentPriceType?: string; 
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
    imageUrl?: string;
    sizes?: ProductSize[];      // Ürünün detay sayfasında size bilgileri.
    prices?: ProductPricing[];  // Ürünün detay sayfasında fiyatlandırma bilgileri.
    currentPriceType?: string; // Ürünün detay sayfasında güncel fiyat türü.
}

/* ------------------ UPDATE ------------------ */
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
    imageUrl?: string;
    tags?: string[];
    sizes?: ProductSizeInput[];       // Güncelleme sırasında eklenebilecek veya düzenlenebilecek size bilgileri.
    prices?: ProductPricingInput[];     // Güncelleme sırasında eklenebilecek veya düzenlenebilecek fiyatlandırma bilgileri.
    currentPriceType?: string; // Güncellenen fiyat türü.
}

export interface UpdateProductResponse {
    status: boolean;
    message: string;
}

/* ------------------ DELETE ------------------ */
export interface DeleteProductRequest {
    productId: number;
}

export interface DeleteProductResponse {
    status: boolean;
    message: string;
}



/* ------------------ INPUT TYPES ------------------ */
export interface ProductSizeInput {
    size: string;
    quantity: number;
}

export interface ProductPricingInput {
    priceType: string;
    price: number;
    currency: string;
}

/* ------------------ ADD SIZE ------------------ */
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

/* ------------------ ADD PRICE ------------------ */
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

/* ------------------ CHECK SIZE AVAILABILITY ------------------ */
export interface IsProductAvailableInSizeRequest {
    productId: number;
    size: string;
}

export interface IsProductAvailableInSizeResponse {
    status: boolean;
    available: boolean;
    message: string;
}

/* ------------------ STOCK OPERATIONS ------------------ */
export interface GetProductStockRequest {
    productId: number;
    size: string;
  }
  
  export interface GetProductStockResponse {
    status: boolean;
    message: string;
    stock: number;
  }
  
  export interface CheckStockBeforeAddingRequest {
    productId: number;
    quantity: number;
    size: string;
  }
  
  export interface CheckStockBeforeAddingResponse {
    status: boolean;
    message: string;
  }
  
  export interface DecreaseStockAfterPurchaseRequest {
    productId: number;
    quantity: number;
    size: string;
  }
  
  export interface DecreaseStockAfterPurchaseResponse {
    status: boolean;
    message: string;
    size: string;
  }

/* ------------------ SERVICE INTERFACE ------------------ */
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

/* ------------------ REVIEW (Varsa) ------------------ */
export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
  }
  
export interface Review {
  reviewId: number;
  userId: string;
  userName?: string;        
  reviewText?: string;
  rating: number;
  createdAt: string;
  status: ReviewStatus;          
}
