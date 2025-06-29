import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
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
  GetCartExpandedResponse,
} from '../../interfaces/cart.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { ProductService } from '../product/product-base.service';
import { AddItemToCartDto, RemoveItemFromCartDto, UpdateCartItemtDto } from 'src/dtos/cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  @Post('add')
  @UseGuards(AuthGuard)
  async addItem(
    @Body() body: AddItemToCartDto,
    @Req() req: Request,
  ): Promise<AddItemToCartResponse> {
    const isItemaddeble = await this.productService.checkStockBeforeAdding({
      productId: body.productId,
      quantity: body.quantity,
      size: body.size,
    });

    if (isItemaddeble.status === false) {
      return {
        status: false,
        message: isItemaddeble.message,
      };
    }

    const addibleData: AddItemToCartRequest = {
      userId: req.user.id,
      item: {
        price: body.price,
        productId: body.productId,
        quantity: body.quantity,
        size: body.size,
      },
    };

    return await this.cartService.addItem(addibleData);
  }

  @Get('get')
  @UseGuards(AuthGuard)
  async getCart(@Req() request: Request): Promise<GetCartExpandedResponse> {
    try {
      const req: GetCartRequest = { userId: request.user.id };

      const cart = await this.cartService.getCart(req);

      if (!cart.status) {
        return {
          status: false,
          message: cart.message || 'Failed to retrieve cart.',
          items: [],
          totalPrice: 0,
        };
      }

      if (!cart.items || cart.items.length === 0) {
        return {
          status: true,
          message: 'Cart is empty.',
          items: [],
          totalPrice: 0,
        };
      }

      const productDetails = await Promise.all(
        cart.items.map((item) =>
          this.productService.getProductById({ productId: item.productId }),
        ),
      );

      const enrichedItems = cart.items.map((item, index) => {
        const product = productDetails[index];

        return {
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          brand: product.brand,
          model: product.model,
          productName: product.productName,
          currency: product.currency,
          color: product.color,
          ImageUrl: product.imageUrl,
        };
      });

      return {
        status: true,
        message: 'Cart details retrieved successfully',
        items: enrichedItems,
        totalPrice: cart.totalPrice,
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message: 'An error occurred while retrieving the cart',
        items: [],
        totalPrice: 0,
      };
    }
  }

  @Put('update')
  @UseGuards(AuthGuard)
  async updateItem(
    @Body() body: UpdateCartItemtDto,
    @Req() req: Request,
  ): Promise<UpdateCartItemResponse> {

    const message: UpdateCartItemRequest = {
      productId: body.productId,
      userId: req.user.id,
      size: body.size,
      quantity: body.quantity
    }
    return await this.cartService.updateItem(message);
  }

  @Post('remove')
  @UseGuards(AuthGuard)
  async removeItem(
    @Body() body: RemoveItemFromCartDto,
    @Req() req: Request,
  ): Promise<RemoveItemFromCartResponse> {
    const message: RemoveItemFromCartRequest = {
      productId: body.productId,
      size: body.size,
      userId: req.user.id,
    }
    return await this.cartService.removeItem(message);
  }

  @Post('clear')
  @UseGuards(AuthGuard)
  async clearCart(@Body() body: ClearCartRequest): Promise<ClearCartResponse> {
    return await this.cartService.clearCart(body);
  }
}
