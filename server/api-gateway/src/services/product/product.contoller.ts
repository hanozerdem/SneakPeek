import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { ProductService } from './product-base.service';
import { ReviewService } from './reviews/product-review.service';
import { OrderService } from '../order/order.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { handleError, handleMappedError } from 'src/exceptions/error-handler';
import {
  CreateProductDto,
  CreateReviewDto,
  UpdateProductDto,
  ApproveReviewDto,
  RejectReviewDto,
} from 'src/dtos/product-base.dto';
import {
  AddPriceToProductRequest,
  AddPriceToProductResponse,
  AddSizeToProductRequest,
  AddSizeToProductResponse,
  CheckStockBeforeAddingRequest,
  CheckStockBeforeAddingResponse,
  CreateProductResponse,
  DecreaseStockAfterPurchaseRequest,
  DecreaseStockAfterPurchaseResponse,
  DeleteProductResponse,
  GetAllProductsResponse,
  GetProductByIdResponse,
  GetProductStockRequest,
  GetProductStockResponse,
  IsProductAvailableInSizeRequest,
  IsProductAvailableInSizeResponse,
  UpdateProductResponse,
} from 'src/interfaces/product-base.interface';
import {
  AddReviewRequest,
  AddReviewResponse,
  ReviewStatus,
  
} from 'src/interfaces/product-review.interface';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
    private readonly orderClient: OrderService,
  ) {}

  /* --------- Product CRUD --------- */

  @Post('/create')
  async createProduct(@Body() product: CreateProductDto): Promise<CreateProductResponse> {
    try {
      return await this.productService.createProduct(product);
    } catch (err) {
      handleError(err);
    }
  }

  @Get('/')
  async getAllProducts(): Promise<GetAllProductsResponse> {
    try {
      return await this.productService.getAllProducts();
    } catch (err) {
      handleMappedError(err);
    }
  }

  @Get('/:id')
  async getProductById(@Param('id') id: number): Promise<GetProductByIdResponse> {
    try {
      return await this.productService.getProductById({ productId: id });
    } catch (err) {
      handleMappedError(err);
    }
  }

  @Put('/update/:id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<UpdateProductResponse> {
    try {
     
      if (Object.keys(updateProductDto).length === 0) {
        return { status: false, message: 'No fields provided for update.' };
      }
     
      

      return await this.productService.updateProduct({ ...updateProductDto, productId: id });
    } catch (err) {
      handleMappedError(err);
    }
  }

  @Delete('/delete/:id')
  async deleteProduct(@Param('id') id: number): Promise<DeleteProductResponse> {
    try {
      return await this.productService.deleteProduct({ productId: id });
    } catch (err) {
      handleMappedError(err);
    }
  }

  /* --------- Review Operations --------- */

  @Post('/review/add')
  @UseGuards(AuthGuard)
  async addReview(@Req() req: Request, @Body() body: CreateReviewDto): Promise<AddReviewResponse> {
    const userId = req.user.id;
    const userName = req.user.username;

    const history = await this.orderClient.getOrderHistory({ userId });
    const bought = history.orders.some(order =>
      order.items.some(item => Number(item.productId) === body.productId),
    );
    if (!bought) throw new ForbiddenException('You can only review products you have purchased');

    const status = body.reviewText?.trim() ? ReviewStatus.PENDING : ReviewStatus.APPROVED;

    return await this.reviewService.addReview({
      productId: body.productId,
      userId,
      userName,
      reviewText: body.reviewText?.trim(),
      rating: body.rating,
    });
  }

  @Get('/review/:id')
  async getReviewsById(@Param('id') id: number) {
    try {
      return await this.reviewService.getReviewsById({ productId: id });
    } catch (err) {
      handleMappedError(err);
    }
  }

  @Delete('/review/:id')
  async deleteReviewById(@Param('id') id: number) {
    try {
      return await this.reviewService.deleteReviewById({ reviewId: id });
    } catch (err) {
      handleMappedError(err);
    }
  }

  @Post('/review/approve')
  async approveReview(@Body() body: ApproveReviewDto) {
    return await this.reviewService.approveReview(body);
  }

  @Post('/review/reject')
  async rejectReview(@Body() body: RejectReviewDto) {
    return await this.reviewService.rejectReview(body);
  }

  /* --------- Stock and Price --------- */

  @Post('/size')
  async addSizeToProduct(@Body() data: AddSizeToProductRequest): Promise<AddSizeToProductResponse> {
    return await this.productService.addSizeToProduct(data);
  }

  @Post('/price')
  async addPriceToProduct(@Body() data: AddPriceToProductRequest): Promise<AddPriceToProductResponse> {
    return await this.productService.addPriceToProduct(data);
  }

  @Get('/:productId/size/:size/availability')
  async isProductAvailableInSize(
    @Param('productId') productId: number,
    @Param('size') size: string,
  ): Promise<IsProductAvailableInSizeResponse> {
    const data: IsProductAvailableInSizeRequest = { productId, size };
    return await this.productService.isProductAvailableInSize(data);
  }

  @Get('/:productId/stock')
  async getProductStock(
    @Param('productId') productId: number,
    @Query('size') size: string,
  ): Promise<GetProductStockResponse> {
    const data: GetProductStockRequest = { productId, size };
    return await this.productService.getProductStock(data);
  }

  @Post('/:productId/stock/check')
  async checkStockBeforeAdding(
    @Param('productId') productId: number,
    @Body() body: CheckStockBeforeAddingRequest,
  ): Promise<CheckStockBeforeAddingResponse> {
    return await this.productService.checkStockBeforeAdding({ ...body, productId });
  }

  @Post('/:productId/stock/decrease')
  async decreaseStockAfterPurchase(
    @Param('productId') productId: number,
    @Body('quantity') quantity: number,
    @Body('size') size: string,
  ): Promise<DecreaseStockAfterPurchaseResponse> {
    const data: DecreaseStockAfterPurchaseRequest = { productId, quantity, size };
    return await this.productService.decreaseStockAfterPurchase(data);
  }
}
