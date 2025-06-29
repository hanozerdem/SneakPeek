import { ProductService } from './product-base.service';
import { CreateProductDto, CreateReviewDto, UpdateProductDto } from 'src/dtos/product-base.dto';
import { AddPriceToProductRequest, AddPriceToProductResponse, AddSizeToProductRequest, AddSizeToProductResponse, CheckStockBeforeAddingResponse, CreateProductResponse, DecreaseStockAfterPurchaseResponse, DeleteProductResponse, GetAllProductsResponse, GetProductByIdResponse, GetProductStockResponse, IsProductAvailableInSizeResponse, UpdateProductResponse } from 'src/interfaces/product-base.interface';
import { AddReviewResponse } from 'src/interfaces/product-review.interface';
import { ReviewService } from './reviews/product-review.service';
import { Request } from 'express';
export declare class ProductController {
    private readonly productService;
    private readonly reviewService;
    constructor(productService: ProductService, reviewService: ReviewService);
    createProduct(product: CreateProductDto): Promise<CreateProductResponse>;
    getAllProducts(): Promise<GetAllProductsResponse>;
    getProductById(id: number): Promise<GetProductByIdResponse>;
    updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<UpdateProductResponse>;
    deleteProduct(id: number): Promise<DeleteProductResponse>;
    addReview(req: Request, body: CreateReviewDto): Promise<AddReviewResponse>;
    getReviewsById(id: number): Promise<GetProductByIdResponse>;
    deleteReviewById(id: number): Promise<DeleteProductResponse>;
    addSizeToProduct(data: AddSizeToProductRequest): Promise<AddSizeToProductResponse>;
    addPriceToProduct(data: AddPriceToProductRequest): Promise<AddPriceToProductResponse>;
    isProductAvailableInSize(productId: number, size: string): Promise<IsProductAvailableInSizeResponse>;
    getProductStock(productId: number): Promise<GetProductStockResponse>;
    checkStockBeforeAdding(productId: number, quantity: number): Promise<CheckStockBeforeAddingResponse>;
    decreaseStockAfterPurchase(productId: number, quantity: number): Promise<DecreaseStockAfterPurchaseResponse>;
}
