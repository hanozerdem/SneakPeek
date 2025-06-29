import { Client, ClientGrpc } from '@nestjs/microservices';
import {
  AddPriceToProductRequest,
  AddPriceToProductResponse,
  AddSizeToProductRequest,
  AddSizeToProductResponse,
  CheckStockBeforeAddingRequest,
  CheckStockBeforeAddingResponse,
  CreateProductRequest,
  CreateProductResponse,
  DecreaseStockAfterPurchaseRequest,
  DecreaseStockAfterPurchaseResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  GetAllProductsResponse,
  GetProductByIdRequest,
  GetProductByIdResponse,
  GetProductStockRequest,
  GetProductStockResponse,
  IsProductAvailableInSizeRequest,
  IsProductAvailableInSizeResponse,
  ProductBaseService,
  UpdateProductRequest,
  UpdateProductResponse,
} from './../../interfaces/product-base.interface';
import { Injectable } from '@nestjs/common';
import { ProductBaseClientOptions } from './product-svc.options';
import { lastValueFrom } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';

@Injectable()
export class ProductService {
  private productBaseService: ProductBaseService;

  @Client(ProductBaseClientOptions)
  private readonly productBaseServiceClient: ClientGrpc;

  onModuleInit() {
    this.productBaseService =
      this.productBaseServiceClient.getService<ProductBaseService>(
        'ProductBaseService',
      );
    if (!this.productBaseService) {
      console.error('Failed to connect productService');
    }
  }

  async createProduct(
    product: CreateProductRequest,
  ): Promise<CreateProductResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.CreateProduct(product),
      );

      return {
        status: response?.status ?? false,
        message: response?.message ?? 'Unknown error occured',
        productId: response?.productId ?? -1,
      };
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_CREATION_FAILED');
    }
  }

  async getAllProducts(): Promise<GetAllProductsResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.GetAllProducts({}),
      );

      return {
        status: response?.status ?? false,
        message: response?.message ?? 'Unknown error occured',
        products: response?.products ?? [],
      };
    } catch (err) {
      console.error(err);
      handleMappedError('GET_PRODUCTS_FAILED');
    }
  }

  async getProductById(
    productID: GetProductByIdRequest,
  ): Promise<GetProductByIdResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.GetProductById(productID),
      );

      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_FIND_FAILED');
    }
  }

  async updateProduct(
    product: UpdateProductRequest,
  ): Promise<UpdateProductResponse> {
    try {
      console.log(product);
      const response = await lastValueFrom(
        this.productBaseService.UpdateProduct(product),
      );
    
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_UPDATE_FAILED');
    }
  }

  async deleteProduct(
    product: DeleteProductRequest,
  ): Promise<DeleteProductResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.DeleteProduct(product),
      );

      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_DELETE_FAILED');
    }
  }

  async addSizeToProduct(
    data: AddSizeToProductRequest,
  ): Promise<AddSizeToProductResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.AddSizeToProduct(data),
      );
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_ADD_SIZE_FAILED');
    }
  }

  async addPriceToProduct(
    data: AddPriceToProductRequest,
  ): Promise<AddPriceToProductResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.AddPriceToProduct(data),
      );
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_ADD_PRICE_FAILED');
    }
  }

  async isProductAvailableInSize(
    data: IsProductAvailableInSizeRequest,
  ): Promise<IsProductAvailableInSizeResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.IsProductAvailableInSize(data),
      );
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_CHECK_SIZE_AVAILABILITY_FAILED');
    }
  }

  async getProductStock(
    data: GetProductStockRequest,
  ): Promise<GetProductStockResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.GetProductStock(data),
      );
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_GET_STOCK_FAILED');
    }
  }

  async checkStockBeforeAdding(
    data: CheckStockBeforeAddingRequest,
  ): Promise<CheckStockBeforeAddingResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.CheckStockBeforeAdding(data),
      );
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_CHECK_STOCK_FAILED');
    }
  }

  async decreaseStockAfterPurchase(
    data: DecreaseStockAfterPurchaseRequest,
  ): Promise<DecreaseStockAfterPurchaseResponse> {
    try {
      const response = await lastValueFrom(
        this.productBaseService.DecreaseStockAfterPurchase(data),
      );
      return response;
    } catch (err) {
      console.error(err);
      handleMappedError('PRODUCT_DECREASE_STOCK_FAILED');
    }
  }
}
