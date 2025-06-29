import { Observable } from 'rxjs';

/* ------------------ ADD TO WISHLIST ------------------ */
export interface AddProductToWishlistRequest {
    userId: string;
    productId: number;
}

export interface AddProductToWishlistResponse {
    status: boolean;
    message: string;
}

/* ------------------ GET USER WISHLIST ------------------ */
export interface GetUserWishlistRequest {
    userId: string;
}

export interface GetUserWishlistResponse {
    status: boolean;
    message: string;
    wishlist: number[]; // repeated int32 wishlist -> TypeScript number[]
}

export interface RemoveProductFromWishlistRequest {
    userId: string;
    productId: number;
}

export interface RemoveProductFromWishlistResponse {
    status: boolean;
    message: string;
}


/* ------------------ SERVICE INTERFACE ------------------ */
export interface WishlistServiceGRPC {
    AddProductToWishlist(data: AddProductToWishlistRequest): Observable<AddProductToWishlistResponse>;
    GetUserWishlist(data: GetUserWishlistRequest): Observable<GetUserWishlistResponse>;
    RemoveProductFromWishlist(data: RemoveProductFromWishlistRequest): Observable<RemoveProductFromWishlistResponse>;
}
