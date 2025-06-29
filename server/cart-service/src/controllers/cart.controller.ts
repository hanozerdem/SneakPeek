import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../providers/cart.service';
import {
  AddItemToCartRequest,
  AddItemToCartResponse,
  RemoveItemFromCartRequest,
  RemoveItemFromCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  GetCartRequest,
  GetCartResponse,
  ClearCartRequest,
  ClearCartResponse,
} from '../interfaces/cart.interface';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @GrpcMethod('CartService', 'AddItem')
  async addItem(data: AddItemToCartRequest): Promise<AddItemToCartResponse> {
    try {
      return await firstValueFrom(this.cartService.addItem(data));
    } catch (err) {
      console.error('Error in GRPC AddItem:', err);
      return { status: false, message: 'Failed to add item to cart: ' + err.message };
    }
  }

  @GrpcMethod('CartService', 'GetCart')
  async getCart(data: GetCartRequest): Promise<GetCartResponse> {
    try {
      console.log(data);
      return await firstValueFrom(this.cartService.getCart(data));
    } catch (err) {
      console.error('Error in GRPC GetCart:', err);
      return {
        status: false,
        message: 'Failed to retrieve cart: ' + err.message,
        items: [],
        totalPrice: 0,
      };
    }
  }

  @GrpcMethod('CartService', 'UpdateItem')
  async updateItem(data: UpdateCartItemRequest): Promise<UpdateCartItemResponse> {
    try {
      return await firstValueFrom(this.cartService.updateItem(data));
    } catch (err) {
      console.error('Error in GRPC UpdateItem:', err);
      return { status: false, message: 'Failed to update cart item: ' + err.message };
    }
  }

  @GrpcMethod('CartService', 'RemoveItem')
  async removeItem(data: RemoveItemFromCartRequest): Promise<RemoveItemFromCartResponse> {
    try {
      return await firstValueFrom(this.cartService.removeItem(data));
    } catch (err) {
      console.error('Error in GRPC RemoveItem:', err);
      return { status: false, message: 'Failed to remove item from cart: ' + err.message };
    }
  }

  @GrpcMethod('CartService', 'ClearCart')
  async clearCart(data: ClearCartRequest): Promise<ClearCartResponse> {
    try {
      return await firstValueFrom(this.cartService.clearCart(data));
    } catch (err) {
      console.error('Error in GRPC ClearCart:', err);
      return { status: false, message: 'Failed to clear cart: ' + err.message };
    }
  }
}
