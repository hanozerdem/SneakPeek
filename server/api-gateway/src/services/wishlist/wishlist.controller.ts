import { 
    AddProductToWishlistRequest, 
    GetUserWishlistRequest, 
    RemoveProductFromWishlistRequest, 
    GetUserWishlistResponse, 
    AddProductToWishlistResponse, 
    RemoveProductFromWishlistResponse 
  } from './../../interfaces/wishlist.interface';
  import { AddProductToWishlistDto, RemoveProductFromWishlistDto } from 'src/dtos/wishlist.dto';
  import { WishlistService } from './wishlist.service';
  import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
  import { handleError } from 'src/exceptions/error-handler';
  import { Request } from 'express';
  import { AuthGuard } from 'src/guards/auth.guard';
  
  @Controller("wishlist")
  export class WishlistController {
      constructor(
          private readonly wishlistService: WishlistService,
      ) {}
  
      // Add a new product to the wishlist
      // If this item already exist return false 
      // Just for users that already logged in
      @Post("/add")
      @UseGuards(AuthGuard)
      async addProductToWishlist(
          @Body() body: AddProductToWishlistDto,
          @Req() req: Request
      ): Promise<AddProductToWishlistResponse> {
          try {
            // get user id from request (requests cookie)
              const data: AddProductToWishlistRequest = { userId: req.user.id, ...body };
              return await this.wishlistService.addProductToWishlist(data);
          } catch(err) {
              handleError(err);
          }
      }
  
      // Get all products that in the users whislist
      // Use cookies to get users id
      @Get()
      @UseGuards(AuthGuard)
      async getUserWishlist(
          @Req() req: Request
      ): Promise<GetUserWishlistResponse> {
          try {
            // Use user id from request and get all products from whislist
              const data: GetUserWishlistRequest = { userId: req.user.id };
              return await this.wishlistService.getProductFromWishlist(data);
          } catch (err) {
              handleError(err);
          }
      }
  

      // Remove given product from users whishlist
      // Also use cookies to get the user Id 
      @Post("/remove")
      @UseGuards(AuthGuard)
      async removeProductFromWishlist(
          @Body() body: RemoveProductFromWishlistDto,
          @Req() req: Request
      ): Promise<RemoveProductFromWishlistResponse> {
          try {
              const data: RemoveProductFromWishlistRequest = { userId: req.user.id, ...body };
              return await this.wishlistService.removeProductFromWishlist(data);
          } catch(err) {
              handleError(err);
          }
      }
  }
  