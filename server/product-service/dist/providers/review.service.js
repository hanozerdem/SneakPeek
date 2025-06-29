"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const review_entity_1 = require("../entities/review.entity");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
let ReviewService = class ReviewService {
    reviewRepository;
    productRepository;
    constructor(reviewRepository, productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }
    async addReview(reviewData) {
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
            if (existingReview) {
                return { status: false, message: "You have already reviewed this product!" };
            }
            console.log(product);
            const newReview = this.reviewRepository.create({
                product: product,
                userID: reviewData.userId,
                reviewText: reviewData.reviewText,
                rating: reviewData.rating,
            });
            await this.reviewRepository.save(newReview);
            await this.updateProductAverageRating(reviewData.productId);
            return { status: true, message: "Review added successfully!" };
        }
        catch (err) {
            console.error(err);
            return { status: false, message: "Failed to add review: " + err.message };
        }
    }
    async getReviewsByProductId(request) {
        try {
            const reviews = await this.reviewRepository.find({
                where: { product: { productID: request.productId } },
                relations: ['product'],
            });
            if (!reviews || reviews.length === 0) {
                return { status: false, message: "There is no reviews for this product!", reviews: [] };
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
                })),
            };
        }
        catch (err) {
            console.error(err);
            return { status: false, message: "Failed to get reviews!", reviews: [] };
        }
    }
    async deleteReview(request) {
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
            await this.updateProductAverageRating(review.product.productID);
            return { status: true, message: "Review deleted successfully!" };
        }
        catch (err) {
            console.error("Error in deleteReview:", err);
            return { status: false, message: "Failed to delete review!" };
        }
    }
    async updateProductAverageRating(productId) {
        const { averageRating } = await this.reviewRepository
            .createQueryBuilder("review")
            .select("AVG(review.rating)", "averageRating")
            .where("review.product = :productId", { productId })
            .getRawOne();
        await this.productRepository.update(productId, { rating: parseFloat(averageRating) || 0 });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map