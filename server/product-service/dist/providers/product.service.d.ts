import { Product } from 'src/entities/product.entity';
import { CreateProductRequest, CreateProductResponse, DeleteProductRequest, DeleteProductResponse, GetAllProductsResponse, GetProductByIdRequest, GetProductByIdResponse, UpdateProductRequest, UpdateProductResponse } from 'src/interfaces/product-base.interface';
import { Repository } from 'typeorm';
export declare class ProductService {
    private readonly productRepository;
    constructor(productRepository: Repository<Product>);
    private readonly productSizeRepository;
    create(productData: CreateProductRequest): Promise<CreateProductResponse>;
    findAll(): Promise<GetAllProductsResponse>;
    getProductById(id: GetProductByIdRequest): Promise<GetProductByIdResponse>;
    updateProduct(product: UpdateProductRequest): Promise<UpdateProductResponse>;
    deleteProduct(productId: DeleteProductRequest): Promise<DeleteProductResponse>;
    getProductStock(productId: number): Promise<number>;
    checkStockBeforeAdding(productId: number, quantity: number): Promise<void>;
    decreaseStockAfterPurchase(productId: number, quantity: number): Promise<void>;
}
