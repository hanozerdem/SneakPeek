/*import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product-base.service';
import { ReviewService } from './reviews/product-review.service';
import { ClientGrpc } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';

jest.mock('src/exceptions/error-handler', () => ({
  handleMappedError: jest.fn(),
}));

const mockGrpcService = {
  CreateProduct: jest.fn(),
  GetAllProducts: jest.fn(),
  GetProductById: jest.fn(),
  UpdateProduct: jest.fn(),
  DeleteProduct: jest.fn(),
  AddSizeToProduct: jest.fn(),
  AddPriceToProduct: jest.fn(),
  IsProductAvailableInSize: jest.fn(),
  GetProductStock: jest.fn(),
  CheckStockBeforeAdding: jest.fn(),
  DecreaseStockAfterPurchase: jest.fn(),
};

const mockReviewGrpcService = {
  AddReview: jest.fn(),
  GetReviewsByProductId: jest.fn(),
  DeleteReview: jest.fn(),
};

const mockClient = {
  getService: jest.fn().mockReturnValue(mockGrpcService),
};

const mockReviewClient = {
  getService: jest.fn().mockReturnValue(mockReviewGrpcService),
};

describe('ProductService & ReviewService Bug-Oriented Tests', () => {
  let productService: ProductService;
  let reviewService: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, ReviewService],
    })
      .overrideProvider('ProductBaseClientOptions')
      .useValue(mockClient)
      .compile();

    productService = module.get<ProductService>(ProductService);
    reviewService = module.get<ReviewService>(ReviewService);

    Object.defineProperty(productService, 'productBaseServiceClient', {
      value: mockClient as unknown as ClientGrpc,
    });
    Object.defineProperty(reviewService, 'productClient', {
      value: mockReviewClient as unknown as ClientGrpc,
    });

    productService.onModuleInit();
    reviewService.onModuleInit();
  });

  afterEach(() => jest.clearAllMocks());

  // ---- CREATE PRODUCT ----
  it('should create product successfully', async () => {
    mockGrpcService.CreateProduct.mockReturnValueOnce(of({
      status: true,
      message: 'Created',
      productId: 1,
    }));
    const result = await productService.createProduct({
      productName: 'Shoe', brand: 'Nike', model: 'X', serialNumber: '1234', price: 100, currency: 'USD', warrantyStatus: 'Yes', distributor: 'Dist'
    });
    expect(result.status).toBe(true);
  });

  it('should handle product creation failure', async () => {
    mockGrpcService.CreateProduct.mockReturnValueOnce(throwError(() => new Error('fail')));
    await productService.createProduct({
      productName: 'fail', brand: 'X', model: 'Y', serialNumber: '000', price: 0, currency: 'TRY', warrantyStatus: 'No', distributor: 'None'
    });
    expect(handleMappedError).toHaveBeenCalledWith('PRODUCT_CREATION_FAILED');
  });

  // ---- GET ALL PRODUCTS ----
  it('should fetch all products', async () => {
    mockGrpcService.GetAllProducts.mockReturnValueOnce(of({
      products: [], status: true, message: 'Success'
    }));
    const res = await productService.getAllProducts();
    expect(res.status).toBe(true);
  });

  // ---- GET PRODUCT BY ID ----
  it('should get product by id', async () => {
    mockGrpcService.GetProductById.mockReturnValueOnce(of({
      productName: 'Shirt', status: true, message: 'found'
    }));
    const res = await productService.getProductById({ productId: 1 });
    expect(res.productName).toBe('Shirt');
  });

  // ---- UPDATE PRODUCT ----
  it('should update product', async () => {
    mockGrpcService.UpdateProduct.mockReturnValueOnce(of({ status: true, message: 'Updated' }));
    const res = await productService.updateProduct({ productId: 1, color: 'Black' });
    expect(res.message).toBe('Updated');
  });

  // ---- DELETE PRODUCT ----
  it('should delete product', async () => {
    mockGrpcService.DeleteProduct.mockReturnValueOnce(of({ status: true, message: 'Deleted' }));
    const res = await productService.deleteProduct({ productId: 1 });
    expect(res.status).toBe(true);
  });

  // ---- STOCK OPERATIONS ----
  it('should add size to product', async () => {
    mockGrpcService.AddSizeToProduct.mockReturnValueOnce(of({ status: true, message: 'Added', newTotalStock: 10 }));
    const res = await productService.addSizeToProduct({ productId: 1, size: 'M', quantity: 5 });
    expect(res.newTotalStock).toBe(10);
  });

  it('should handle AddPriceToProduct error', async () => {
    mockGrpcService.AddPriceToProduct.mockReturnValueOnce(throwError(() => new Error('fail')));
    await productService.addPriceToProduct({ productId: 1, price: 100, currency: 'USD', priceType: 'SALE' });
    expect(handleMappedError).toHaveBeenCalledWith('PRODUCT_ADD_PRICE_FAILED');
  });

  it('should check availability', async () => {
    mockGrpcService.IsProductAvailableInSize.mockReturnValueOnce(of({ available: true, status: true, message: 'Available' }));
    const res = await productService.isProductAvailableInSize({ productId: 1, size: 'L' });
    expect(res.available).toBe(true);
  });

  it('should get stock', async () => {
    mockGrpcService.GetProductStock.mockReturnValueOnce(of({ status: true, message: 'Stock found', stock: 50 }));
    const res = await productService.getProductStock({ productId: 1 });
    expect(res.stock).toBe(50);
  });

  it('should handle stock check before adding', async () => {
    mockGrpcService.CheckStockBeforeAdding.mockReturnValueOnce(of({ status: true, message: 'Enough stock' }));
    const res = await productService.checkStockBeforeAdding({ productId: 1, quantity: 2 });
    expect(res.message).toMatch(/Enough/);
  });

  it('should decrease stock', async () => {
    mockGrpcService.DecreaseStockAfterPurchase.mockReturnValueOnce(of({ status: true, message: 'Decreased' }));
    const res = await productService.decreaseStockAfterPurchase({ productId: 1, quantity: 1 });
    expect(res.message).toMatch(/Decreased/);
  });

  // ------------------ REVIEW TESTS ------------------

  it('should add review', async () => {
    mockReviewGrpcService.AddReview.mockReturnValueOnce(of({ status: true, message: 'Added' }));
    const res = await reviewService.addReview({ productId: 2, userId: '1', rating: 5 });
    expect(res.status).toBe(true);
  });

  it('should get reviews by product id', async () => {
    mockReviewGrpcService.GetReviewsByProductId.mockReturnValueOnce(of({ status: true, message: 'Fetched', reviews: [] }));
    const res = await reviewService.getReviewsById({ productId: 1 });
    expect(res.status).toBe(true);
  });

  it('should delete review by id', async () => {
    mockReviewGrpcService.DeleteReview.mockReturnValueOnce(of({ status: true, message: 'Deleted' }));
    const res = await reviewService.deleteReviewById({ reviewId: 99 });
    expect(res.message).toMatch(/Deleted/);
  });
});
*/