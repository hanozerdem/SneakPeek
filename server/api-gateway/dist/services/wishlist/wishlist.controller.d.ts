import { GetUserWishlistResponse, AddProductToWishlistResponse, RemoveProductFromWishlistResponse } from './../../interfaces/wishlist.interface';
import { AddProductToWishlistDto, RemoveProductFromWishlistDto } from 'src/dtos/wishlist.dto';
import { WishlistService } from './wishlist.service';
import { Request } from 'express';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    addProductToWishlist(body: AddProductToWishlistDto, req: Request): Promise<AddProductToWishlistResponse>;
    getUserWishlist(req: Request): Promise<GetUserWishlistResponse>;
    removeProductFromWishlist(body: RemoveProductFromWishlistDto, req: Request): Promise<RemoveProductFromWishlistResponse>;
}
