import {
  AddPriceToProductRequest,
  AddPriceToProductResponse,
  AddSizeToProductRequest,
  AddSizeToProductResponse,
  CheckStockBeforeAddingRequest,
  DeleteProductRequest,
  DeleteProductResponse,
  GetAllProductsResponse,
  GetProductByIdRequest,
  GetProductByIdResponse,
  GetProductStockRequest,
  GetProductStockResponse,
  IsProductAvailableInSizeRequest,
  IsProductAvailableInSizeResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  CheckStockBeforeAddingResponse,
  DecreaseStockAfterPurchaseResponse,
  DecreaseStockAfterPurchaseRequest,
  GetAllProductsRequest,
} from './../interfaces/product-base.interface';
import { Controller, OnModuleInit } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateProductRequest,
  CreateProductResponse,
} from 'src/interfaces/product-base.interface';
import {
  AddReviewRequest,
  AddReviewResponse,
  DeleteReviewRequest,
  DeleteReviewResponse,
  GetReviewsRequest,
  GetReviewsResponse,
} from 'src/interfaces/product-review.interface';
import { ProductService } from 'src/providers/product.service';
import { ReviewService } from 'src/providers/review.service';

@Controller()
export class ProductController implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
  ) {}

  // This function runs when service starts
  onModuleInit() {
    console.log('Product service grpc is running!');
  }

  @GrpcMethod('ProductBaseService', 'CreateProduct')
  async createProduct(
    data: CreateProductRequest,
  ): Promise<CreateProductResponse> {
    return await this.productService.create(data);
  }

  @GrpcMethod('ProductBaseService', 'GetAllProducts')
  async getAllProducts(
    data: GetAllProductsRequest,
  ): Promise<GetAllProductsResponse> {
    return await this.productService.findAll();
  }

  @GrpcMethod('ProductBaseService', 'GetProductById')
  async getProductById(
    data: GetProductByIdRequest,
  ): Promise<GetProductByIdResponse> {
    return await this.productService.getProductById(data);
  }

  @GrpcMethod('ProductBaseService', 'UpdateProduct')
  async updateProduct(
    data: UpdateProductRequest,
  ): Promise<UpdateProductResponse> {
    return await this.productService.updateProduct(data);
  }

  @GrpcMethod('ProductBaseService', 'DeleteProduct')
  async deleteProduct(
    data: DeleteProductRequest,
  ): Promise<DeleteProductResponse> {
    return await this.productService.deleteProduct(data);
  }

  @GrpcMethod('ProductBaseService', 'AddSizeToProduct')
  async addSizeToProduct(
    data: AddSizeToProductRequest,
  ): Promise<AddSizeToProductResponse> {
    return await this.productService.addSizeToProduct(data);
  }

  @GrpcMethod('ProductBaseService', 'AddPriceToProduct')
  async addPriceToProduct(
    data: AddPriceToProductRequest,
  ): Promise<AddPriceToProductResponse> {
    return await this.productService.addPriceToProduct(data);
  }

  @GrpcMethod('ProductBaseService', 'IsProductAvailableInSize')
  async isProductAvailableInSize(
    data: IsProductAvailableInSizeRequest,
  ): Promise<IsProductAvailableInSizeResponse> {
    return await this.productService.isProductAvailableInSize(data);
  }

  /*--------------- Review ---------------*/

  @GrpcMethod('ProductReviewService', 'AddReview')
  async AddReview(review: AddReviewRequest): Promise<AddReviewResponse> {
    try {
      const response = await this.reviewService.addReview(review);
      return response;
    } catch (err) {
      console.error('Error in AddReview:', err);
      return {
        status: false,
        message: 'An error occured during add a new review!',
      };
    }
  }

  @GrpcMethod('ProductReviewService', 'GetReviewsByProductId')
  async GetReviews(review: GetReviewsRequest): Promise<GetReviewsResponse> {
    try {
      const response = await this.reviewService.getReviewsByProductId(review);
      return response;
    } catch (err) {
      console.error('Error in GetReviewsByProductId:', err);
      return {
        status: false,
        message: 'An error occured when getting reviews method!',
      };
    }
  }

  @GrpcMethod('ProductReviewService', 'DeleteReview')
  async DeleteReview(
    review: DeleteReviewRequest,
  ): Promise<DeleteReviewResponse> {
    try {
      const response = await this.reviewService.deleteReview(review);
      return response;
    } catch (err) {
      console.error('Error in DeleteReview:', err);
      return {
        status: false,
        message:
          'An error occured during delete the review by giving product id!',
      };
    }
  }
  @GrpcMethod('ProductReviewService', 'ApproveReview')
  
  @GrpcMethod('ProductReviewService', 'ApproveReview')
  async ApproveReview(data: { reviewId: string }): Promise<{ status: boolean; message: string }> {
    try {
      const response = await this.reviewService.approveReview(data.reviewId);
      return {
        status: response.status,
        message: response.message,
      };
    } catch (err) {
      console.error('Error in ApproveReview:', err);
      return {
        status: false,
        message: 'An error occurred during approve review!',
      };
    }
  }
  
  @GrpcMethod('ProductReviewService', 'RejectReview')
  async RejectReview(data: { reviewId: string }): Promise<{ status: boolean; message: string }> {
    try {
      const response = await this.reviewService.rejectReview(data.reviewId);
      return {
        status: response.status,
        message: response.message,
      };
    } catch (err) {
      console.error('Error in RejectReview:', err);
      return {
        status: false,
        message: 'An error occurred during reject review!',
      };
    }
  }
  
  /*--------------- Stock Endpoints ---------------*/

  @GrpcMethod('ProductBaseService', 'GetProductStock')
  async getProductStock(
    data: GetProductStockRequest,
  ): Promise<GetProductStockResponse> {
    return await this.productService.getProductStock(data);
  }

  @GrpcMethod('ProductBaseService', 'CheckStockBeforeAdding')
  async checkStockBeforeAdding(
    data: CheckStockBeforeAddingRequest,
  ): Promise<CheckStockBeforeAddingResponse> {
    return await this.productService.checkStockBeforeAdding(data);
  }

  @GrpcMethod('ProductBaseService', 'DecreaseStockAfterPurchase')
  async decreaseStockAfterPurchase(
    data: DecreaseStockAfterPurchaseRequest,
  ): Promise<DecreaseStockAfterPurchaseResponse> {
    return await this.productService.decreaseStockAfterPurchase(data);
  }
}
