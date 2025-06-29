import { AddReviewRequest, AddReviewResponse, DeleteReviewRequest, DeleteReviewResponse, GetReviewsRequest, GetReviewsResponse } from "src/interfaces/product-review.interface";
export declare class ReviewService {
    private productReviewService;
    private readonly productClient;
    onModuleInit(): void;
    addReview(review: AddReviewRequest): Promise<AddReviewResponse>;
    getReviewsById(review: GetReviewsRequest): Promise<GetReviewsResponse>;
    deleteReviewById(review: DeleteReviewRequest): Promise<DeleteReviewResponse>;
}
