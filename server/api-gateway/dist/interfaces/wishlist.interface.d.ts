import { Observable } from 'rxjs';
export interface AddProductToWishlistRequest {
    userId: string;
    productId: number;
}
export interface AddProductToWishlistResponse {
    status: boolean;
    message: string;
}
export interface GetUserWishlistRequest {
    userId: string;
}
export interface GetUserWishlistResponse {
    status: boolean;
    message: string;
    wishlist: number[];
}
export interface RemoveProductFromWishlistRequest {
    userId: string;
    productId: number;
}
export interface RemoveProductFromWishlistResponse {
    status: boolean;
    message: string;
}
export interface WishlistServiceGRPC {
    AddProductToWishlist(data: AddProductToWishlistRequest): Observable<AddProductToWishlistResponse>;
    GetUserWishlist(data: GetUserWishlistRequest): Observable<GetUserWishlistResponse>;
    RemoveProductFromWishlist(data: RemoveProductFromWishlistRequest): Observable<RemoveProductFromWishlistResponse>;
}
