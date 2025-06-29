import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './providers/review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import {
  AddReviewRequest, 
  DeleteReviewRequest, 
  GetReviewsRequest 
} from './interfaces/product-review.interface';

describe('ReviewService - Bug Cases', () => {
  let reviewService: ReviewService;

  const mockReviewRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockProductRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);

    jest.clearAllMocks();

    mockReviewRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ averageRating: '4.5' }),
    });
  });

  describe('AddReview', () => {
    it('should add a review successfully', async () => {
      const addReviewDto: AddReviewRequest = {
        productId: 1,
        userId: 1,
        reviewText: 'Great product!',
        rating: 5,
      };
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });
      mockReviewRepo.findOne.mockResolvedValueOnce(null);
      mockReviewRepo.save.mockResolvedValueOnce({ ...addReviewDto, reviewID: 1 });

      const result = await reviewService.addReview(addReviewDto);
      expect(result.status).toBe(true);
      expect(result.message).toBe('Review added successfully!');
    });

    it('should reject duplicate review from the same user for the same product', async () => {
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });
      mockReviewRepo.findOne.mockResolvedValueOnce({ reviewID: 1 });
      const result = await reviewService.addReview({
        productId: 1,
        userId: 1,
        reviewText: 'Duplicate text',
        rating: 4,
      });
      expect(result.status).toBe(false);
      expect(result.message).toBe('You have already reviewed this product!');
    });

    it('should fail if rating is negative', async () => {
      const addReviewDto: AddReviewRequest = {
        productId: 1,
        userId: 1,
        reviewText: 'Should fail',
        rating: -2,
      };
      mockProductRepo.findOne.mockResolvedValueOnce({ productID: 1 });

      const result = await reviewService.addReview(addReviewDto);
      expect(result.status).toBe(false);
      expect(result.message).toContain('Invalid rating');
    });
  });

  describe('GetReviews', () => {
    it('should return all reviews for a product', async () => {
      mockReviewRepo.find.mockResolvedValueOnce([
        { reviewID: 1, userID: 1, reviewText: 'Great product!', rating: 5, createdAt: new Date() },
      ]);

      const result = await reviewService.getReviewsByProductId({ productId: 1 });
      expect(result.status).toBe(true);
      expect(result.reviews?.length).toBe(1);
    });

    it('should return no reviews if none exist for the product', async () => {
      mockReviewRepo.find.mockResolvedValueOnce([]);
      const result = await reviewService.getReviewsByProductId({ productId: 999 });
      expect(result.status).toBe(false);
      expect(result.message).toBe('There is no reviews for this product!');
    });
  });

  describe('DeleteReview', () => {
    it('should delete a review successfully', async () => {
      mockReviewRepo.findOne.mockResolvedValueOnce({ reviewID: 1, product: { productID: 1 } });
      mockReviewRepo.delete.mockResolvedValueOnce({ affected: 1 });
      const result = await reviewService.deleteReview({ reviewId: 1 });
      expect(result.status).toBe(true);
      expect(result.message).toBe('Review deleted successfully!');
    });

    it('should return failure if review does not exist', async () => {
      mockReviewRepo.findOne.mockResolvedValueOnce(null);
      const result = await reviewService.deleteReview({ reviewId: 999 });
      expect(result.status).toBe(false);
      expect(result.message).toBe('Review not found!');
    });

    it('should fail if db error occurs on delete', async () => {
      mockReviewRepo.findOne.mockResolvedValueOnce({ reviewID: 1, product: { productID: 1 } });
      mockReviewRepo.delete.mockRejectedValueOnce(new Error('DB error'));
      const result = await reviewService.deleteReview({ reviewId: 1 });
      expect(result.status).toBe(false);
      expect(result.message).toContain('Failed to delete review!');
    });
    
  });
});