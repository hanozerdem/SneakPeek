import { Observable } from "rxjs";
export interface AddReviewRequest {
    productId: number;
    userId: number;
    reviewText?: string;
    rating: number;
}
export interface AddReviewResponse {
    status: boolean;
    message: string;
}
export interface GetReviewsRequest {
    productId: number;
}
export interface GetReviewsResponse {
    status: boolean;
    message: string;
    reviews?: Review[];
}
export interface Review {
    reviewId: number;
    userId: number;
    reviewText?: string;
    rating: number;
    createdAt: string;
}
export interface DeleteReviewRequest {
    reviewId: number;
}
export interface DeleteReviewResponse {
    status: boolean;
    message: string;
}
export interface ProductReviewService {
    AddReview(data: AddReviewRequest): Observable<AddReviewResponse>;
    GetReviewsByProductId(data: GetReviewsRequest): Observable<GetReviewsResponse>;
    DeleteReview(data: DeleteReviewRequest): Observable<DeleteReviewResponse>;
}
