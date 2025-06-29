import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';


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
  CartServiceInterface,
} from '../../interfaces/cart.interface';
import { CartClientOptions } from './cart-svc.option';

@Injectable()
export class CartService implements OnModuleInit {
  private cartService: CartServiceInterface;

  @Client(CartClientOptions)
  private readonly cartServiceClient: ClientGrpc;

  onModuleInit() {
    this.cartService = this.cartServiceClient.getService<CartServiceInterface>('CartService');
    if (!this.cartService) {
      console.error("Failed to connect to CartService");
    }
  }

  async addItem(data: AddItemToCartRequest): Promise<AddItemToCartResponse> {
    try {
      const response = await lastValueFrom(this.cartService.addItem(data));
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError("CART_ADD_FAILED");
    }
  }

  async getCart(data: GetCartRequest): Promise<GetCartResponse> {
    try {
      const response = await lastValueFrom(this.cartService.getCart(data));
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError("CART_GET_FAILED");
    }
  }

  async updateItem(data: UpdateCartItemRequest): Promise<UpdateCartItemResponse> {
    try {
      const response = await lastValueFrom(this.cartService.updateItem(data));
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError("CART_UPDATE_FAILED");
    }
  }

  async removeItem(data: RemoveItemFromCartRequest): Promise<RemoveItemFromCartResponse> {
    try {
      const response = await lastValueFrom(this.cartService.removeItem(data));
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError("CART_REMOVE_FAILED");
    }
  }

  async clearCart(data: ClearCartRequest): Promise<ClearCartResponse> {
    try {
      const response = await lastValueFrom(this.cartService.clearCart(data));
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError("CART_CLEAR_FAILED");
    }
  }
}
