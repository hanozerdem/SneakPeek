import { Review } from 'src/entities/review.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';
import { AddReviewRequest, AddReviewResponse, DeleteReviewRequest, DeleteReviewResponse, GetReviewsRequest, GetReviewsResponse } from 'src/interfaces/product-review.interface';
export declare class ReviewService {
    private readonly reviewRepository;
    private readonly productRepository;
    constructor(reviewRepository: Repository<Review>, productRepository: Repository<Product>);
    addReview(reviewData: AddReviewRequest): Promise<AddReviewResponse>;
    getReviewsByProductId(request: GetReviewsRequest): Promise<GetReviewsResponse>;
    deleteReview(request: DeleteReviewRequest): Promise<DeleteReviewResponse>;
    updateProductAverageRating(productId: number): Promise<void>;
}
