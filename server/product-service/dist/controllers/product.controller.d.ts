import { DeleteProductRequest, DeleteProductResponse, GetAllProductsResponse, GetProductByIdRequest, GetProductByIdResponse, UpdateProductRequest, UpdateProductResponse } from './../interfaces/product-base.interface';
import { OnModuleInit } from '@nestjs/common';
import { CreateProductRequest, CreateProductResponse } from 'src/interfaces/product-base.interface';
import { AddReviewRequest, AddReviewResponse, DeleteReviewRequest, DeleteReviewResponse, GetReviewsRequest, GetReviewsResponse } from 'src/interfaces/product-review.interface';
import { ProductService } from 'src/providers/product.service';
import { ReviewService } from 'src/providers/review.service';
export declare class ProductController implements OnModuleInit {
    private readonly productService;
    private readonly reviewService;
    constructor(productService: ProductService, reviewService: ReviewService);
    onModuleInit(): void;
    createProduct(product: CreateProductRequest): Promise<CreateProductResponse>;
    GetAllProducts(): Promise<GetAllProductsResponse>;
    GetProductById(productId: GetProductByIdRequest): Promise<GetProductByIdResponse>;
    UpdateProduct(product: UpdateProductRequest): Promise<UpdateProductResponse>;
    DeleteProduct(productId: DeleteProductRequest): Promise<DeleteProductResponse>;
    AddReview(review: AddReviewRequest): Promise<AddReviewResponse>;
    GetReviews(review: GetReviewsRequest): Promise<GetReviewsResponse>;
    DeleteReview(review: DeleteReviewRequest): Promise<DeleteReviewResponse>;
    GetProductStock(request: {
        productId: number;
    }): Promise<{
        status: boolean;
        message: string;
        stock?: number;
    }>;
    CheckStockBeforeAdding(request: {
        productId: number;
        quantity: number;
    }): Promise<{
        status: boolean;
        message: string;
    }>;
    DecreaseStockAfterPurchase(request: {
        productId: number;
        quantity: number;
    }): Promise<{
        status: boolean;
        message: string;
    }>;
}
