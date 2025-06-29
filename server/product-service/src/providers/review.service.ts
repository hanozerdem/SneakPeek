import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from "@nestjs/common";
import { Review } from 'src/entities/review.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';

import { AddReviewRequest, AddReviewResponse, DeleteReviewRequest, DeleteReviewResponse, GetReviewsRequest, GetReviewsResponse, ReviewStatus } from 'src/interfaces/product-review.interface';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,

        @InjectRepository(Product) 
        private readonly productRepository: Repository<Product>
    ) {}
      //Helper function to increase popularity score
    async incrementProductPopularity(productId: number, increment: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { productID: productId } });
    if (!product) return;

    const newScore = (product.popularity || 0) + increment;
    await this.productRepository.update(productId, { popularity: newScore });
}

async addReview(reviewData: AddReviewRequest): Promise<AddReviewResponse> {
    try {
      const product = await this.productRepository.findOne({ where: { productID: reviewData.productId } });
      if (!product) {
        return { status: false, message: "Product not found!" };
      }
  
      const existingReview = await this.reviewRepository.findOne({
        where: {
          product: { productID: reviewData.productId },
          userID: reviewData.userId,
        },
      });
  
      if (!reviewData.reviewText && (reviewData.rating === null || reviewData.rating === undefined)) {
        return {
          status: false,
          message: "At least one of rating or reviewText must be provided.",
        };
      }
  
      if (existingReview) {
        return { status: false, message: "You have already reviewed this product!" };
      }
  
      const newReview = this.reviewRepository.create({
        product: product,
        userID: reviewData.userId,
        reviewText: reviewData.reviewText,
        rating: reviewData.rating,
      });
  
      const savedReview = await this.reviewRepository.save(newReview);
  
      await this.updateProductAverageRating(reviewData.productId);
      await this.incrementProductPopularity(reviewData.productId, 2);
  
     
      return {
        status: true,
        message: "Review added successfully!",
        review: {
          reviewId: savedReview.reviewID,
          userId: savedReview.userID,
          userName: reviewData.userName || "",
          reviewText: savedReview.reviewText || "",
          rating: savedReview.rating,
          createdAt: savedReview.createdAt.toISOString(),
          status: savedReview.status,
        },
      };
  
    } catch (err) {
      console.error(err);
      return { status: false, message: "Failed to add review: " + err.message };
    }
  }
  

    async getReviewsByProductId(request: GetReviewsRequest): Promise<GetReviewsResponse> {
        try {
            const reviews = await this.reviewRepository.find({
                where: { product: { productID: request.productId } },
                relations: ['product'], 
            });

            if(!reviews || reviews.length === 0) {
                return { status: false, message: "There is no reviews for this product!" , reviews: []};
            }

            return {
                status: true,
                message: "Reviews get successfully!",
                reviews: reviews.map((review) => ({
                    reviewId: review.reviewID,
                    userId: review.userID,
                    reviewText: review.reviewText,
                    rating: review.rating,
                    createdAt: review.createdAt.toISOString(),
                    status: review.status,
                })),
            };
        } catch (err) {
            console.error(err);
            return { status: false, message: "Failed to get reviews!" , reviews: []};
        }
    }

   
    async deleteReview(request: DeleteReviewRequest): Promise<DeleteReviewResponse> {
        try {
            const review = await this.reviewRepository.findOne({
                where: { reviewID: request.reviewId },
                relations: ['product'], 
            });
    
            if (!review) {
                return { status: false, message: "Review not found!" };
            }
    
            if (!review.product) {
                return { status: false, message: "Review is not linked to any product!" };
            }
    
            await this.reviewRepository.delete(request.reviewId);
            await this.incrementProductPopularity(review.product.productID, -2); // Decrease popularity by 3 for each review deletion

    
            await this.updateProductAverageRating(review.product.productID);
    
            return { status: true, message: "Review deleted successfully!" };
        } catch (err) {
            console.error("Error in deleteReview:", err);
            return { status: false, message: "Failed to delete review!" };
        }
    }
    async approveReview(reviewId: string): Promise<AddReviewResponse> {
        const review = await this.reviewRepository.findOne({
            where: { reviewID: Number(reviewId) }, 
          });
      
        if (!review) {
          return { status: false, message: "Review not found" };
        }
      
        review.status = ReviewStatus.APPROVED;
        await this.reviewRepository.save(review);
      
        return { status: true, message: "Review approved successfully" };
      }
      async rejectReview(reviewId: string): Promise<AddReviewResponse> {
        const review = await this.reviewRepository.findOne({
            where: { reviewID: Number(reviewId) }, 
          });
      
        if (!review) {
          return { status: false, message: "Review not found" };
        }
      
        review.status = ReviewStatus.REJECTED;
        await this.reviewRepository.save(review);
      
        return { status: true, message: "Review rejected successfully" };
      }
    
    async updateProductAverageRating(productId: number): Promise<void> {
        const { averageRating } = await this.reviewRepository
          .createQueryBuilder("review")
          .select("AVG(review.rating)", "averageRating")
          .where("review.product = :productId", { productId })
          .getRawOne();
      
        const product = await this.productRepository.findOne({
          where: { productID: productId },
          relations: ['reviews'],
        });
      
        const reviewCount = product?.reviews?.length ?? 0;
        const rating = parseFloat(averageRating) || 0;
        const sales = product?.sales || 0;
      
        const popularityScore = sales * 3 + reviewCount * 2 + rating * 5;
      
        await this.productRepository.update(productId, {
          rating: rating,
          popularity: popularityScore,
        });
      }
      
}