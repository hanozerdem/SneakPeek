import { AddPriceToProductRequest, AddPriceToProductResponse, AddSizeToProductRequest, AddSizeToProductResponse, CheckStockBeforeAddingRequest, CheckStockBeforeAddingResponse, CreateProductRequest, CreateProductResponse, DecreaseStockAfterPurchaseRequest, DecreaseStockAfterPurchaseResponse, DeleteProductRequest, DeleteProductResponse, GetAllProductsResponse, GetProductByIdRequest, GetProductByIdResponse, GetProductStockRequest, GetProductStockResponse, IsProductAvailableInSizeRequest, IsProductAvailableInSizeResponse, UpdateProductRequest, UpdateProductResponse } from './../../interfaces/product-base.interface';
export declare class ProductService {
    private productBaseService;
    private readonly productBaseServiceClient;
    onModuleInit(): void;
    createProduct(product: CreateProductRequest): Promise<CreateProductResponse>;
    getAllProducts(): Promise<GetAllProductsResponse>;
    getProductById(productID: GetProductByIdRequest): Promise<GetProductByIdResponse>;
    updateProduct(product: UpdateProductRequest): Promise<UpdateProductResponse>;
    deleteProduct(product: DeleteProductRequest): Promise<DeleteProductResponse>;
    addSizeToProduct(data: AddSizeToProductRequest): Promise<AddSizeToProductResponse>;
    addPriceToProduct(data: AddPriceToProductRequest): Promise<AddPriceToProductResponse>;
    isProductAvailableInSize(data: IsProductAvailableInSizeRequest): Promise<IsProductAvailableInSizeResponse>;
    getProductStock(data: GetProductStockRequest): Promise<GetProductStockResponse>;
    checkStockBeforeAdding(data: CheckStockBeforeAddingRequest): Promise<CheckStockBeforeAddingResponse>;
    decreaseStockAfterPurchase(data: DecreaseStockAfterPurchaseRequest): Promise<DecreaseStockAfterPurchaseResponse>;
}
