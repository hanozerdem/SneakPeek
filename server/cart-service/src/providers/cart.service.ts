import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cartItem.entity';
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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,

    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
  ) {}

  addItem(data: AddItemToCartRequest): Observable<AddItemToCartResponse> {
    return from(
      (async (): Promise<AddItemToCartResponse> => {
        try {
          let cart = await this.cartRepo.findOne({
            where: { userId: data.userId },
            relations: ['items'],
          });

          if (!cart) {
            cart = this.cartRepo.create({ userId: data.userId, items: [] });
            cart = await this.cartRepo.save(cart);
          }

          const existingItem = cart.items.find(
            (item) =>
              item.productId === data.item.productId &&
              item.size === data.item.size,
          );

          if (existingItem) {
            existingItem.quantity += data.item.quantity;
            await this.cartItemRepo.save(existingItem);
          } else {
            const newItem = this.cartItemRepo.create({
              productId: data.item.productId,
              size: data.item.size,
              quantity: data.item.quantity,
              price: data.item.price,
              cart: cart,
            });
            await this.cartItemRepo.save(newItem);
          }

          return {
            status: true,
            message: 'Item added to cart successfully!',
            cartId: cart.id,
          };
        } catch (err) {
          console.error('Error in addItem:', err);
          return {
            status: false,
            message: 'Failed to add item to cart: ' + err.message,
          };
        }
      })(),
    );
  }

  getCart(data: GetCartRequest): Observable<GetCartResponse> {
    return from(
      (async (): Promise<GetCartResponse> => {
        try {
          const cart = await this.cartRepo.findOne({
            where: { userId: data.userId },
            relations: ['items'],
          });
          
          if (!cart) {
            return {
              status: true,
              message: `No cart found for user ID ${data.userId}.`,
              items: [],
              totalPrice: 0,
            };
          }
          const totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
          );

          return {
            status: true,
            message: 'Cart retrieved successfully.',
            items: cart.items.map((item) => ({
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
            totalPrice,
          };
        } catch (err) {
          console.error('Error in getCart:', err);
          return {
            status: false,
            message: 'Failed to retrieve cart: ' + err.message,
            items: [],
            totalPrice: 0,
          };
        }
      })(),
    );
  }

  updateItem(data: UpdateCartItemRequest): Observable<UpdateCartItemResponse> {
    return from(
      (async (): Promise<UpdateCartItemResponse> => {
        try {
          const cart = await this.cartRepo.findOne({
            where: { userId: data.userId },
            relations: ['items'],
          });

          if (!cart) {
            return {
              status: false,
              message: `Cart for user ID ${data.userId} not found.`,
            };
          }

          const item = cart.items.find(
            (i) =>
              i.productId === data.productId &&
              i.size === data.size,
          );

          if (!item) {
            return {
              status: false,
              message: `Item with product ID ${data.productId} and size ${data.size} not found in the user's cart.`,
            };
          }

          if (data.quantity <= 0) {
            return {
              status: false,
              message: `Invalid quantity ${data.quantity}. Quantity must be greater than zero.`,
            };
          }

          item.quantity = data.quantity;
          await this.cartItemRepo.save(item);

          return {
            status: true,
            message: `Item updated successfully. Product ID ${data.productId} (Size: ${data.size}) now has quantity ${data.quantity}.`,
          };
        } catch (err) {
          console.error('Error in updateItem:', err);
          return {
            status: false,
            message: 'Failed to update cart item: ' + err.message,
          };
        }
      })(),
    );
  }

  removeItem(data: RemoveItemFromCartRequest): Observable<RemoveItemFromCartResponse> {
    return from(
      (async (): Promise<RemoveItemFromCartResponse> => {
        try {
          const cart = await this.cartRepo.findOne({
            where: { userId: data.userId },
            relations: ['items'],
          });

          if (!cart) {
            return {
              status: false,
              message: `Cart for user ID ${data.userId} not found.`,
            };
          }

          const item = cart.items.find(
            (i) =>
              i.productId === data.productId &&
              i.size === data.size,
          );

          if (!item) {
            return {
              status: false,
              message: `Item with product ID ${data.productId} and size ${data.size} not found in the cart.`,
            };
          }

          await this.cartItemRepo.delete(item.id);

          return {
            status: true,
            message: 'Item removed from cart successfully.',
          };
        } catch (err) {
          console.error('Error in removeItem:', err);
          return {
            status: false,
            message: 'Failed to remove item from cart: ' + err.message,
          };
        }
      })(),
    );
  }

  clearCart(data: ClearCartRequest): Observable<ClearCartResponse> {
    return from(
      (async (): Promise<ClearCartResponse> => {
        try {
          const cart = await this.cartRepo.findOne({
            where: { userId: data.userId },
            relations: ['items'],
          });

          if (!cart) {
            return {
              status: false,
              message: `Cart for user ID ${data.userId} not found.`,
            };
          }

          for (const item of cart.items) {
            await this.cartItemRepo.delete(item.id);
          }

          return {
            status: true,
            message: 'Cart cleared successfully.',
          };
        } catch (err) {
          console.error('Error in clearCart:', err);
          return {
            status: false,
            message: 'Failed to clear cart: ' + err.message,
          };
        }
      })(),
    );
  }
}
