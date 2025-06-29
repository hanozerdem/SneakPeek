import { Client, ClientGrpc } from '@nestjs/microservices';
import { UserServiceClientOptions } from '../auth/auth-svc.options';
import { 
  AddProductToWishlistRequest, 
  AddProductToWishlistResponse, 
  GetUserWishlistRequest, 
  GetUserWishlistResponse, 
  RemoveProductFromWishlistRequest,
  RemoveProductFromWishlistResponse,
  WishlistServiceGRPC 
} from './../../interfaces/wishlist.interface';
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';
import { GetProductByIdResponse } from 'src/interfaces/product-base.interface';
import { ProductService } from '../product/product-base.service';

@Injectable()
export class WishlistService {
    constructor( 
        private readonly productService: ProductService,
    ) {}

    private wishlistService: WishlistServiceGRPC;

    // Use grpc to communicate with user service
    @Client(UserServiceClientOptions)
    // Grpc client that use nest js Grpc Client
    private readonly wishlistServiceClient: ClientGrpc;

    onModuleInit() {
        // whislist service uses interface that similar to the grpc definations
        this.wishlistService = this.wishlistServiceClient.getService<WishlistServiceGRPC>('WishlistService');
        if (!this.wishlistService) {
            console.error("Failed to connect to WishlistService");
        }
    }

    // Communicate with user service addProductToWishlist method
    async addProductToWishlist(data: AddProductToWishlistRequest): Promise<AddProductToWishlistResponse> {
        try {
            // Validate that there is a product with that given id
            const res: GetProductByIdResponse = await this.productService.getProductById({ productId: data.productId });
            if (!res.status) {
                return {
                    status: false,
                    message: res.message,
                };
            }

            const response = await lastValueFrom(this.wishlistService.AddProductToWishlist(data));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred",
            };
        } catch (err) {
            console.error(err);
            handleMappedError("ADD_TO_WISHLIST_FAILED");
        }
    }

    // Get all products in wishlist from given user
    async getProductFromWishlist(data: GetUserWishlistRequest): Promise<GetUserWishlistResponse> {
        try {
            const response = await lastValueFrom(this.wishlistService.GetUserWishlist(data));
            return {
                status: response?.status ?? false,
                wishlist: response?.wishlist,
                message: response?.message ?? "Unknown error occurred",
            };
        } catch (err) {
            console.error(err);
            handleMappedError("GET_WISHLIST_FAILED");
        }
    }

    // Remove product from wishlist from given user id
    async removeProductFromWishlist(data: RemoveProductFromWishlistRequest): Promise<RemoveProductFromWishlistResponse> {
        try {
            const response = await lastValueFrom(this.wishlistService.RemoveProductFromWishlist(data));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred",
            };
        } catch (err) {
            console.error(err);
            handleMappedError("REMOVE_FROM_WISHLIST_FAILED");
        }
    }
}
