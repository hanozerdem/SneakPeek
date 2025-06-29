// cart.service.spec.ts
import { CartService } from './providers/cart.service';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cartItem.entity';
import {
  AddItemToCartRequest,
  RemoveItemFromCartRequest,
  UpdateCartItemRequest,
  GetCartRequest,
  ClearCartRequest,
} from './interfaces/cart.interface';
import { Repository, DeleteResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

// Helpers
const createFakeCart = (overrides = {}): CartEntity => ({
  id: 1,
  userId: 100,
  items: [],
  createdAt: new Date(),
  ...overrides,
});

const createFakeItem = (overrides = {}): CartItemEntity => ({
  id: 1,
  productId: 999,
  quantity: 2,
  price: 50,
  cart: createFakeCart(),
  ...overrides,
});

describe('CartService Bug-Oriented Tests', () => {
  let cartService: CartService;
  let cartRepo: jest.Mocked<Repository<CartEntity>>;
  let itemRepo: jest.Mocked<Repository<CartItemEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItemEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    cartRepo = module.get(getRepositoryToken(CartEntity));
    itemRepo = module.get(getRepositoryToken(CartItemEntity));
  });

  describe('BUG: price is NaN in getCart()', () => {
    it('should handle NaN prices and return totalPrice = 0', async () => {
      const cart = createFakeCart({
        items: [{ productId: 1, quantity: 1, price: NaN }],
      });
      cartRepo.findOne.mockResolvedValue(cart);
      const result = await cartService.getCart({ userId: 100 }).toPromise();
      expect(result!.totalPrice).toBe(0);
    });
  });

  describe('BUG: Add item with negative price', () => {
    it('should reject item with negative price', async () => {
      const request: AddItemToCartRequest = {
        userId: 100,
        item: { productId: 1, quantity: 1, price: -99 },
      };

      cartRepo.findOne.mockResolvedValue(createFakeCart());
      itemRepo.create.mockReturnValue(createFakeItem({ price: -99 }));
      itemRepo.save.mockResolvedValue(createFakeItem({ price: -99 }));

      const result = await cartService.addItem(request).toPromise();
      expect(result!.status).toBe(false);
      expect(result!.message).toMatch(/invalid price/i);
    });
  });

  describe('BUG: Update item with zero quantity does not remove item', () => {
    it('should reject update with quantity 0 or less', async () => {
      const item = createFakeItem({ quantity: 2 });
      const cart = createFakeCart({ items: [item] });
      cartRepo.findOne.mockResolvedValue(cart);

      const result = await cartService
        .updateItem({ userId: 100, productId: 999, quantity: 0 })
        .toPromise();

      expect(result!.status).toBe(false);
      expect(result!.message).toMatch(/quantity must be greater than zero/i);
    });
  });

  describe('BUG: clearCart should stop deleting if one fails', () => {
    it('should return failure if any item deletion fails', async () => {
      const item1 = createFakeItem({ id: 1 });
      const item2 = createFakeItem({ id: 2 });
      const cart = createFakeCart({ items: [item1, item2] });
      cartRepo.findOne.mockResolvedValue(cart);
      itemRepo.delete
        .mockResolvedValueOnce({} as DeleteResult)
        .mockRejectedValueOnce(new Error('DB error'));

      const result = await cartService.clearCart({ userId: 100 }).toPromise();
      expect(result!.status).toBe(false);
      expect(result!.message).toMatch(/failed to clear cart/i);
    });
  });

  describe('BUG: cart not found during update', () => {
    it('should return error if cart not found', async () => {
      cartRepo.findOne.mockResolvedValue(null);
      const result = await cartService.updateItem({ userId: 1, productId: 1, quantity: 2 }).toPromise();
      expect(result!.status).toBe(false);
      expect(result!.message).toMatch(/not found/i);
    });
  });

  describe('BUG: removeItem with missing cart', () => {
    it('should return error if cart is missing', async () => {
      cartRepo.findOne.mockResolvedValue(null);
      const result = await cartService.removeItem({ userId: 1, productId: 1 }).toPromise();
      expect(result!.status).toBe(false);
      expect(result!.message).toMatch(/not found/i);
    });
  });

  describe('BUG: addItem fails on cart creation', () => {
    it('should return failure if cart creation fails', async () => {
      cartRepo.findOne.mockResolvedValue(null);
      cartRepo.create.mockReturnValue(createFakeCart());
      cartRepo.save.mockRejectedValue(new Error('create fail'));

      const result = await cartService.addItem({ userId: 100, item: { productId: 1, quantity: 1, price: 99 } }).toPromise();
      expect(result!.status).toBe(false);
      expect(result!.message).toMatch(/failed to add item/i);
    });
  });
});
