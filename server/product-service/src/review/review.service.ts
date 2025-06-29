import { Injectable } from '@nestjs/common';


export interface Review { //export demeli miyim 
    id: string;
    productId: string;
    userId: string;
    content: string;
  }


  @Injectable()
  export class ReviewService {
    private reviews: Review[] = []; // Mock veri olarak kullanıyoruz
    private ratings: { [key: string]: number[] } = {}; // Ürün ID bazlı puanlar
  
    addReview(productId: string, userId: string, content: string) {
      const review: Review = { id: Date.now().toString(), productId, userId, content };
      this.reviews.push(review);
      return review;
    }
  
    getReviews(productId: string) {
      return this.reviews.filter(review => review.productId === productId);
    }


    deleteReview(reviewId: string) {
        this.reviews = this.reviews.filter(review => review.id !== reviewId);
        return { message: 'Review deleted' };
      }
    
      addRating(productId: string, userId: string, rating: number) {
        if (![0, 1, 2, 3, 4, 5].includes(rating)) {
          throw new Error('Invalid rating! Rating must be between 0 and 5.');
        }
        if (!this.ratings[productId]) {
          this.ratings[productId] = [];
        }
        this.ratings[productId].push(rating);
        return { productId, rating };
      }
    
      getRatings(productId: string) {
        return this.ratings[productId] || [];
      }
  }
