import { Observable } from "rxjs";

/* ------------------ REVIEW ------------------ */

// Review status enum
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Review {
  reviewId: number;
  userId: string;
  userName?: string;
  reviewText?: string;
  rating: number;
  createdAt: string;
  status: ReviewStatus;
}

/* ------------------ ADD ------------------ */
export interface AddReviewRequest {
  productId: number;
  userId: string;
  reviewText?: string;
  rating: number;
  userName: string;
}

export interface AddReviewResponse {
  status: boolean;
  message: string;
  review?: Review;
}

/* ------------------ GET ------------------ */
export interface GetReviewsRequest {
  productId: number;
}

export interface GetReviewsResponse {
  status: boolean;
  message: string;
  reviews?: Review[];
}

/* ------------------ UPDATE ------------------ */
export interface UpdateReviewRequest {
  reviewId: number;
  reviewText?: string;
  rating?: number;
}

export interface UpdateReviewResponse {
  status: boolean;
  message: string;
  review?: Review;
}

/* ------------------ DELETE ------------------ */
export interface DeleteReviewRequest {
  reviewId: number;
}

export interface DeleteReviewResponse {
  status: boolean;
  message: string;
}

/* ------------------ APPROVE ------------------ */
export interface ApproveReviewRequest {
  reviewId: string;
}

export interface ApproveReviewResponse {
  status: boolean;
  message: string;
}

/* ------------------ REJECT ------------------ */
export interface RejectReviewRequest {
  reviewId: string;
}

export interface RejectReviewResponse {
  status: boolean;
  message: string;
}

/* ------------------ SERVICE INTERFACE ------------------ */
export interface ProductReviewService {
  AddReview(data: AddReviewRequest): Observable<AddReviewResponse>;
  GetReviewsByProductId(data: GetReviewsRequest): Observable<GetReviewsResponse>;
  UpdateReview(data: UpdateReviewRequest): Observable<UpdateReviewResponse>;
  DeleteReview(data: DeleteReviewRequest): Observable<DeleteReviewResponse>;
  ApproveReview(data: ApproveReviewRequest): Observable<ApproveReviewResponse>;
  RejectReview(data: RejectReviewRequest): Observable<RejectReviewResponse>;
}
