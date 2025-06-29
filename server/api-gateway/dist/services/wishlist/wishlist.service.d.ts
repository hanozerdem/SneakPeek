import { AddProductToWishlistRequest, AddProductToWishlistResponse, GetUserWishlistRequest, GetUserWishlistResponse, RemoveProductFromWishlistRequest, RemoveProductFromWishlistResponse } from './../../interfaces/wishlist.interface';
import { ProductService } from '../product/product-base.service';
export declare class WishlistService {
    private readonly productService;
    constructor(productService: ProductService);
    private wishlistService;
    private readonly wishlistServiceClient;
    onModuleInit(): void;
    addProductToWishlist(data: AddProductToWishlistRequest): Promise<AddProductToWishlistResponse>;
    getProductFromWishlist(data: GetUserWishlistRequest): Promise<GetUserWishlistResponse>;
    removeProductFromWishlist(data: RemoveProductFromWishlistRequest): Promise<RemoveProductFromWishlistResponse>;
}
