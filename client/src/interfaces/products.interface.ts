export interface ProductResponse {
    status: boolean;
    message: string;
    products: Product[];
  }
  
  export interface Product {
    currentPriceType: string;
    imageUrl?: string;
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
    popularity?: number;
    sales?: number;
    productStatus?: 'ACTIVE' | 'INACTIVE';
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
  export interface ProductSizeInput {
    size: string;
    quantity: number;
  }
  
  export interface ProductPricingInput {
    priceType: string;
    price: number;
    currency: string;
  }
  
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
    imageUrl?: string;
    tags?: string[];
    sizes?: ProductSizeInput[];
    prices?: ProductPricingInput[];
    productStatus: 'ACTIVE' | 'INACTIVE';
  }
  
  export interface CreateProductResponse {
    status: boolean;
    message: string;
    productId?: number;
  }
  export interface UpdateProductRequest {
    productId: number;
    productName?: string;
    model?: string;
    brand?: string;
    serialNumber?: string;
    warrantyStatus?: string;
    distributor?: string;
    description?: string;
    color?: string;
    category?: string;
    imageUrl?: string;
    tags?: string[];
    sizes?: ProductSizeInput[];
    prices?: ProductPricingInput[];
    productStatus?: 'ACTIVE' | 'INACTIVE';
    price?: number;
    currency?: string;
  }
  
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
  