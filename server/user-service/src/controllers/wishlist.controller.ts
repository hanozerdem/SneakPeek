import { Controller, OnModuleInit } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { WishlistService } from "src/providers/wishlist.service";
import { GetUserWishlistRequest, GetWishlistResponse, WishlistRequest, WishlistResponse } from "src/interfaces/wishlist.interface";

@Controller()
export class WishlistController implements OnModuleInit {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Called when the module is initialized.
   * This logs that the Wishlist gRPC server has started.
   */
  onModuleInit() {
    console.log('WishlistService gRPC server started!');
  }

  /**
   * gRPC method for adding a product to the wishlist.
   * 
   * @param data - The wishlist request data containing userId and productId.
   * @returns A response object indicating success or failure.
   */
  @GrpcMethod('WishlistService', 'AddProductToWishlist')
  async addProductToWishlist(data: WishlistRequest): Promise<WishlistResponse> {
    try {
      // Validate that the request contains the required fields
      if (!data || !data.userId || !data.productId) {
        return {
          status: false,
          message: "Invalid request: userId and productId are required.",
        };
      }

      // Delegate to the service layer for business logic execution
      return await this.wishlistService.addProductToWishlist(data);
    } catch (err) {
      console.error("Error in WishlistController.addProductToWishlist:", err);
      return {
        status: false,
        message: "Internal server error.",
      };
    }
  }

  /**
   * gRPC method for removing a product from the wishlist.
   * 
   * @param data - The wishlist request data containing userId and productId.
   * @returns A response object indicating success or failure.
   */
  @GrpcMethod('WishlistService', 'RemoveProductFromWishlist')
  async removeProductFromWishlist(data: WishlistRequest): Promise<WishlistResponse> {
    try {
      // Validate that the request contains the required fields
      if (!data || !data.userId || !data.productId) {
        return {
          status: false,
          message: "Invalid request: userId and productId are required.",
        };
      }

      // Delegate to the service layer for business logic execution
      return await this.wishlistService.removeProductFromWishlist(data);
    } catch (err) {
      console.error("Error in WishlistController.removeProductFromWishlist:", err);
      return {
        status: false,
        message: "Internal server error.",
      };
    }
  }

  /**
   * gRPC method for retrieving the user's wishlist.
   * 
   * @param data - The request data containing the userId.
   * @returns A response object with the user's wishlist, status, and message.
   */
  @GrpcMethod('WishlistService', 'GetUserWishlist')
  async getWishlist(data: GetUserWishlistRequest): Promise<GetWishlistResponse> {
    try {
      // Validate that the request contains the required field (userId)
      if (!data || !data.userId) {
        return {
          status: false,
          message: "Invalid request: userId is required.",
        };
      }

      // Delegate to the service layer to retrieve the wishlist
      return await this.wishlistService.getWishlist(data);
    } catch (err) {
      console.error("Error in WishlistController.getWishlist:", err);
      return {
        status: false,
        message: "Internal server error.",
      };
    }
  }
}
