import { Injectable, OnModuleInit } from "@nestjs/common";
import { Client, ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import {
  AddReviewRequest,
  AddReviewResponse,
  DeleteReviewRequest,
  DeleteReviewResponse,
  GetReviewsRequest,
  GetReviewsResponse,
  ProductReviewService,
} from "src/interfaces/product-review.interface";
import { ProductBaseClientOptions } from "../product-svc.options";
import { handleMappedError } from "src/exceptions/error-handler";

@Injectable()
export class ReviewService implements OnModuleInit {
  private productReviewService: ProductReviewService;

  @Client(ProductBaseClientOptions)
  private readonly productClient: ClientGrpc;

  onModuleInit() {
    this.productReviewService = this.productClient.getService<ProductReviewService>('ProductReviewService');
    if (!this.productReviewService) {
      console.error("Failed to connect to ProductReviewService");
    } else {
      console.log(" ProductReviewService connected successfully!");
    }
  }

  async addReview(review: AddReviewRequest): Promise<AddReviewResponse> {
    try {
      const response = await lastValueFrom(this.productReviewService.AddReview(review));
      if (!response.review) {
        throw new Error("REVIEW_REJECT_FAILED: Missing review in response");
      }
      return response as AddReviewResponse;
    } catch (err) {
      console.error("Error in addReview:", err);
      handleMappedError("REVIEW_ADD_FAILED");
    }
  }

  async getReviewsById(review: GetReviewsRequest): Promise<GetReviewsResponse> {
    try {
      const response = await lastValueFrom(this.productReviewService.GetReviewsByProductId(review));
      return response;
    } catch (err) {
      console.error("Error in getReviewsById:", err);
      handleMappedError("REVIEW_GET_FAILED");
    }
  }

  async deleteReviewById(review: DeleteReviewRequest): Promise<DeleteReviewResponse> {
    try {
      const response = await lastValueFrom(this.productReviewService.DeleteReview(review));
      return response;
    } catch (err) {
      console.error("Error in deleteReviewById:", err);
      handleMappedError("REVIEW_DELETE_FAILED");
    }
  }

  async approveReview(body: { reviewId: string }): Promise<AddReviewResponse> {
    try {
      const response = await lastValueFrom(this.productReviewService.ApproveReview({ reviewId: body.reviewId }));
      return response;
    } catch (err) {
      console.error("Error in approveReview:", err);
      handleMappedError("REVIEW_APPROVE_FAILED");
    }
  }

  async rejectReview(body: { reviewId: string }): Promise<AddReviewResponse> {
    try {
      const response = await lastValueFrom(this.productReviewService.RejectReview({ reviewId: body.reviewId }));
      return response;
    } catch (err) {
      console.error("Error in rejectReview:", err);
      handleMappedError("REVIEW_REJECT_FAILED");
    }
  }
}
