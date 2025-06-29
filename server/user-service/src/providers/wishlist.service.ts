import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../models/user.model";
import { WishlistRequest, WishlistResponse, GetWishlistResponse, GetUserWishlistRequest } from "src/interfaces/wishlist.interface";

@Injectable()
export class WishlistService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Adds a product to the user's wishlist.
   * 
   * @param data - The wishlist request data containing userId and productId.
   * @returns A response object with the status and message of the operation.
   */
  async addProductToWishlist(data: WishlistRequest): Promise<WishlistResponse> {
    try {
      // Convert productId to a number to ensure proper type
      const productId = Number(data.productId);
      if (isNaN(productId)) {
        return {
          status: false,
          message: "Invalid productId format.",
        };
      }

      // Find the user by ID in the database
      const user = await this.userModel.findById(data.userId);
      if (!user) {
        return {
          status: false,
          message: "User not found.",
        };
      }

      // Check if the product already exists in the user's wishlist
      if (user.wishlist.includes(productId)) {
        return {
          status: false,
          message: "Product is already in the wishlist.",
        };
      }

      // Add the product to the wishlist and save the user document
      user.wishlist.push(productId);
      await user.save();

      return {
        status: true,
        message: "Product added to wishlist successfully.",
      };
    } catch (error) {
      console.error("Error in WishlistService.addProductToWishlist:", error);
      return {
        status: false,
        message: "Internal server error.",
      };
    }
  }

  /**
   * Removes a product from the user's wishlist.
   * 
   * @param data - The wishlist request data containing userId and productId.
   * @returns A response object with the status and message of the operation.
   */
  async removeProductFromWishlist(data: WishlistRequest): Promise<WishlistResponse> {
    try {
      // Convert productId to a number to ensure proper type
      const productId = Number(data.productId);
      if (isNaN(productId)) {
        return {
          status: false,
          message: "Invalid productId format.",
        };
      }

      // Find the user by ID in the database
      const user = await this.userModel.findById(data.userId);
      if (!user) {
        return {
          status: false,
          message: "User not found.",
        };
      }

      // Check if the product exists in the wishlist
      if (!user.wishlist.includes(productId)) {
        return {
          status: false,
          message: "Product is not in the wishlist.",
        };
      }

      // Remove the product from the wishlist and save the updated document
      user.wishlist = user.wishlist.filter(id => id !== productId);
      await user.save();

      return {
        status: true,
        message: "Product removed from wishlist successfully.",
      };
    } catch (error) {
      console.error("Error in WishlistService.removeProductFromWishlist:", error);
      return {
        status: false,
        message: "Internal server error.",
      };
    }
  }

  /**
   * Retrieves the wishlist for a given user.
   * 
   * @param data - The request data containing the userId.
   * @returns A response object with the wishlist items (as strings), status, and message.
   */
  async getWishlist(data: GetUserWishlistRequest): Promise<GetWishlistResponse> {
    try {
      // Find the user by ID in the database
      const user = await this.userModel.findById(data.userId);
      if (!user) {
        return {
          status: false,
          message: "User not found.",
        };
      }

      // Return the wishlist with numbers converted to strings for consistency
      return {
        status: true,
        message: "ok",
        wishlist: user.wishlist.map(id => String(id)),
      };
    } catch (error) {
      console.error("Error in WishlistService.getWishlist:", error);
      return {
        status: false,
        message: "Internal server error.",
      };
    }
  }
}
