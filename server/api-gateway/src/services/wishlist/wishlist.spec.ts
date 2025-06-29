// src/services/wishlist/wishlist.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { ProductService } from '../product/product-base.service';
import { ClientGrpc } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';

jest.mock('src/exceptions/error-handler', () => ({
  handleMappedError: jest.fn(),
}));

const mockWishlistGrpcService = {
  AddProductToWishlist: jest.fn(),
  GetUserWishlist: jest.fn(),
  RemoveProductFromWishlist: jest.fn(),
};

const mockProductService = {
  getProductById: jest.fn(),
};

const mockWishlistClient = {
  getService: jest.fn().mockReturnValue(mockWishlistGrpcService),
};

describe('WishlistService Bug-Oriented Unit Tests', () => {
  let service: WishlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: ProductService, useValue: mockProductService },
      ],
    })
      .overrideProvider('UserServiceClientOptions')
      .useValue(mockWishlistClient)
      .compile();

    service = module.get<WishlistService>(WishlistService);

    Object.defineProperty(service, 'wishlistServiceClient', {
      value: mockWishlistClient as unknown as ClientGrpc,
    });

    service.onModuleInit();
  });

  afterEach(() => jest.clearAllMocks());

  describe('addProductToWishlist()', () => {
    it('should add product to wishlist successfully', async () => {
      mockProductService.getProductById.mockResolvedValueOnce({
        status: true,
        message: 'found',
      });
      mockWishlistGrpcService.AddProductToWishlist.mockReturnValueOnce(
        of({ status: true, message: 'Added' }),
      );

      const result = await service.addProductToWishlist({
        productId: 1,
        userId: '123',
      });

      expect(result).toEqual({ status: true, message: 'Added' });
    });

    it('should return failure if product not found', async () => {
      mockProductService.getProductById.mockResolvedValueOnce({
        status: false,
        message: 'Not found',
      });

      const result = await service.addProductToWishlist({
        productId: -1,
        userId: '123',
      });

      expect(result.status).toBe(false);
      expect(result.message).toBe('Not found');
    });

    it('should handle gRPC error during wishlist addition', async () => {
      mockProductService.getProductById.mockResolvedValueOnce({
        status: true,
        message: 'found',
      });

      mockWishlistGrpcService.AddProductToWishlist.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );

      await service.addProductToWishlist({ productId: 1, userId: 'x' });

      expect(handleMappedError).toHaveBeenCalledWith('ADD_TO_WISHLIST_FAILED');
    });
  });

  describe('getProductFromWishlist()', () => {
    it('should return wishlist products', async () => {
      mockWishlistGrpcService.GetUserWishlist.mockReturnValueOnce(
        of({ status: true, message: 'Success', wishlist: [] }),
      );

      const result = await service.getProductFromWishlist({ userId: 'abc' });

      expect(result.status).toBe(true);
      expect(result.wishlist).toEqual([]);
    });

    it('should handle gRPC failure in GetUserWishlist', async () => {
      mockWishlistGrpcService.GetUserWishlist.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );

      await service.getProductFromWishlist({ userId: 'abc' });

      expect(handleMappedError).toHaveBeenCalledWith('GET_WISHLIST_FAILED');
    });
  });

  describe('removeProductFromWishlist()', () => {
    it('should remove product from wishlist successfully', async () => {
      mockWishlistGrpcService.RemoveProductFromWishlist.mockReturnValueOnce(
        of({ status: true, message: 'Removed' }),
      );

      const result = await service.removeProductFromWishlist({
        userId: 'abc',
        productId: 3,
      });

      expect(result.status).toBe(true);
      expect(result.message).toBe('Removed');
    });

    it('should handle error when removing product from wishlist', async () => {
      mockWishlistGrpcService.RemoveProductFromWishlist.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );

      await service.removeProductFromWishlist({
        userId: 'abc',
        productId: 999,
      });

      expect(handleMappedError).toHaveBeenCalledWith('REMOVE_FROM_WISHLIST_FAILED');
    });
  });
});
