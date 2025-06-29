import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { ReviewService} from './review.service';

@Controller('products')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  
  @Post(':id/reviews')
  addReview(
    @Param('id') productId: string,
    @Body('userId') userId: string,
    @Body('content') content: string,
  ) {
    return this.reviewService.addReview(productId, userId, content);
  }

  
  @Get(':id/reviews')
  getReviews(@Param('id') productId: string) {
    return this.reviewService.getReviews(productId);
  }

  
  @Delete('reviews/:reviewId/approve')
  deleteReview(@Param('reviewId') reviewId: string) {
    return this.reviewService.deleteReview(reviewId);
  }

  
  @Post(':id/ratings')
  addRating(
    @Param('id') productId: string,
    @Body('userId') userId: string,
    @Body('rating') rating: number,
  ) {
    return this.reviewService.addRating(productId, userId, rating);
  }

  
  @Get(':id/ratings')
  getRatings(@Param('id') productId: string) {
    return this.reviewService.getRatings(productId);
  }
}
