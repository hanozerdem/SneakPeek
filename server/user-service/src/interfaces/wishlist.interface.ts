export interface WishlistRequest {
    userId: string;
    productId: string;
}

export interface WishlistResponse {
    status: boolean;
    message: string;
}

export interface GetWishlistResponse {
    status: boolean;
    wishlist?: string[];
    message?: string;
}

export interface GetUserWishlistRequest {
    userId: string;
}