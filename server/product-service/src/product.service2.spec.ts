// product.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './providers/product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductSize } from './entities/product-size.entity';
import { ProductPricing } from './entities/product-pricing.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import {
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  DeleteProductRequest,
  GetProductByIdRequest,
  GetAllProductsResponse,
  GetProductStockRequest,
  DecreaseStockAfterPurchaseRequest,
  AddSizeToProductRequest,
  CheckStockBeforeAddingRequest,
} from './interfaces/product-base.interface';

describe('ProductService - Bug-Oriented Cases', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;
  let productSizeRepository: Repository<ProductSize>;
  let productPricingRepository: Repository<ProductPricing>;

  // Create mock repositories for Product, ProductSize, and ProductPricing
  const mockProductRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockSizeRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
  const mockPricingRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(ProductSize), useValue: mockSizeRepo },
        { provide: getRepositoryToken(ProductPricing), useValue: mockPricingRepo },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    productSizeRepository = module.get<Repository<ProductSize>>(getRepositoryToken(ProductSize));
    productPricingRepository = module.get<Repository<ProductPricing>>(getRepositoryToken(ProductPricing));

    jest.clearAllMocks();
  });

  // --- Create Product Tests ---
  describe('create', () => {
    it('should create a new sneaker product successfully', async () => {
      const createProductDto: CreateProductRequest = {
        productName: 'AirMax 2025',
        model: 'AM2025',
        brand: 'Nike',
        serialNumber: 'AM2025-001',
        price: 250,
        currency: 'USD',
        warrantyStatus: '2 years',
        distributor: 'Nike Official',
      };

      // Simulate the repository behavior: create and save
      mockProductRepo.create.mockReturnValue(createProductDto);
      mockProductRepo.save.mockResolvedValue({ ...createProductDto, productID: 1 });

      const result = await productService.create(createProductDto);
      expect(result.status).toBe(true);
      expect(result.message).toBe('Product is created successfully!');
      expect(result.productId).toBe(1);
    });

    it('should return failure if productRepository.save throws an error', async () => {
      const createProductDto: CreateProductRequest = {
        productName: 'AirMax 2025',
        model: 'AM2025',
        brand: 'Nike',
        serialNumber: 'AM2025-001',
        price: 250,
        currency: 'USD',
        warrantyStatus: '2 years',
        distributor: 'Nike Official',
      };

      mockProductRepo.create.mockReturnValue(createProductDto);
      // Simulate a DB error during save
      mockProductRepo.save.mockRejectedValue(new Error('DB save error'));

      const result = await productService.create(createProductDto);
      expect(result.status).toBe(false);
      expect(result.message).toContain('Failed to create product');
    });

    // Bug-case: Negative price should be rejected (if validation is added)
    it('should fail if price is negative', async () => {
      const createDto: CreateProductRequest = {
        productName: 'AirMax 2025',
        model: 'AM2025',
        brand: 'Nike',
        serialNumber: 'AM2025-002',
        price: -100, // Negative price
        currency: 'USD',
        warrantyStatus: '2 years',
        distributor: 'Nike Official',
      };

      // Simulate the behavior when negative price is not allowed
      mockProductRepo.create.mockReturnValue(createDto);
      mockProductRepo.save.mockRejectedValue(new Error('Invalid price'));

      const result = await productService.create(createDto);
      expect(result.status).toBe(false);
      expect(result.message).toContain('Invalid price');
    });

    // Bug-case: Missing required field (e.g., productName)
    it('should fail if productName is missing', async () => {
      const incompleteDto = {
        model: 'AM2025',
        brand: 'Nike',
        serialNumber: 'AM2025-003',
        price: 250,
        currency: 'USD',
        warrantyStatus: '2 years',
        distributor: 'Nike Official',
      } as any;

      mockProductRepo.create.mockReturnValue(incompleteDto);
      mockProductRepo.save.mockRejectedValue(new Error('DB save error'));

      const result = await productService.create(incompleteDto);
      expect(result.status).toBe(false);
      expect(result.message).toContain('Failed to create product');
    });
  });

  // --- Get All Products Tests ---
  describe('findAll', () => {
    it('should return all sneaker products successfully', async () => {
      const mockProducts = [
        { productID: 1, productName: 'AirMax 2025', price: 250, sizes: [], prices: [], reviews: [], rating: 4.5 },
        { productID: 2, productName: 'AirMax 2024', price: 230, sizes: [], prices: [], reviews: [], rating: 4.0 },
      ];
      mockProductRepo.find.mockResolvedValueOnce(mockProducts as any);

      const result = await productService.findAll();
      expect(result.status).toBe(true);
      expect(result.products.length).toBe(2);
    });

    it('should return failure if products cannot be fetched', async () => {
      jest.spyOn(productRepository, 'find').mockRejectedValueOnce(new Error('Error fetching products'));
      const result = await productService.findAll();
      expect(result.status).toBe(false);
      expect(result.message).toBe('Product not found!');
    });
  });

  // --- Get Product By ID Tests ---
  describe('getProductById', () => {
    it('should return a sneaker product by id successfully', async () => {
      const mockProduct = { productID: 1, productName: 'AirMax 2025', price: 250, sizes: [], prices: [] };
      mockProductRepo.findOne.mockResolvedValueOnce(mockProduct as any);

      const result = await productService.getProductById({ productId: 1 });
      expect(result.status).toBe(true);
      expect(result.productName).toBe('AirMax 2025');
    });

    it('should return failure if the product is not found', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(null);
      const result = await productService.getProductById({ productId: 999 });
      expect(result.status).toBe(false);
      expect(result.message).toBe('Product not found!');
    });
  });

  // --- Update Product Tests ---
  describe('updateProduct', () => {
    it('should update sneaker product details successfully', async () => {
      const updateDto: UpdateProductRequest = { productId: 1, price: 300 };
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });
      // Simulate a successful update returning an UpdateResult
      mockProductRepo.update.mockResolvedValueOnce({ affected: 1 } as UpdateResult);

      const result = await productService.updateProduct(updateDto);
      expect(result.status).toBe(true);
      expect(result.message).toBe('Product updated successfully!');
    });

    it('should return failure if the product is not found during update', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(null);
      const result = await productService.updateProduct({ productId: 999, price: 300 });
      expect(result.status).toBe(false);
      expect(result.message).toBe('Product not found!');
    });

    it('should fail if an extremely large price update is attempted', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });
      // Simulate update rejection due to invalid price
      mockProductRepo.update.mockRejectedValueOnce(new Error('Invalid price'));

      const result = await productService.updateProduct({
        productId: 1,
        price: Number.MAX_SAFE_INTEGER,
      });
      expect(result.status).toBe(false);
      expect(result.message).toContain('Invalid price');
    });
  });

  // --- Delete Product Tests ---
  describe('deleteProduct', () => {
    it('should delete a sneaker product successfully', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });
      mockProductRepo.delete.mockResolvedValueOnce({ affected: 1 } as DeleteResult);

      const result = await productService.deleteProduct({ productId: 1 });
      expect(result.status).toBe(true);
      expect(result.message).toBe('Product deleted successfully!');
    });

    it('should return failure if the product is not found during deletion', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(null);
      mockProductRepo.delete.mockResolvedValueOnce({ affected: 0 } as DeleteResult);

      const result = await productService.deleteProduct({ productId: 999 });
      expect(result.status).toBe(false);
      expect(result.message).toBe('Product not found!');
    });

    it('should fail if delete operation throws an error', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });
      mockProductRepo.delete.mockRejectedValueOnce(new Error('Delete error'));

      const result = await productService.deleteProduct({ productId: 1 });
      expect(result.status).toBe(false);
      expect(result.message).toContain('There was an error while deleting the product');
    });
  });

  // --- Stock & Size Edge Cases ---
  describe('Stock & Size Edge Cases', () => {
    it('should fail to add size if product is not found', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(null);
      const result = await productService.addSizeToProduct({
        productId: 999,
        size: '42',
        quantity: 10,
      });
      expect(result.status).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should fail if adding negative quantity size', async () => {
      // Simulate: Product found but negative quantity is invalid.
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1, sizes: [] });
      // Assume service returns a message "Invalid quantity" if quantity is negative.
      const result = await productService.addSizeToProduct({
        productId: 1,
        size: '42',
        quantity: -5,
      } as any);
      expect(result.status).toBe(false);
      expect(result.message).toContain('Invalid quantity');
    });

    it('should decrease stock after purchase correctly', async () => {
      const mockProduct = {
        productID: 1,
        sizes: [{ size: '42', quantity: 20 }],
      };
      mockProductRepo.findOne.mockResolvedValueOnce(mockProduct as any);

      const result = await productService.decreaseStockAfterPurchase({
        size: '42',
        productId: 1,
        quantity: 10,
      });
      expect(result.status).toBe(true);
      expect(result.message).toBe('Stock decreased successfully');
    });

    it('should fail to decrease stock if product is not found', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce(null);
      const result = await productService.decreaseStockAfterPurchase({
        size: '42',
        productId: 123,
        quantity: 5,
      });
      expect(result.status).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should fail to check stock if requested quantity is negative', async () => {
      // Simulate that the system does not allow negative quantities.
      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce({
        productID: 1,
        sizes: [{ size: '42', quantity: 20 }],
        totalStock: 20,
      } as any);

      const result = await productService.checkStockBeforeAdding({
        size: '42',
        productId: 1,
        quantity: -5,
      });
      expect(result.status).toBe(false);
      expect(result.message).toContain('Quantity cannot be negative');
    });
  });
});
