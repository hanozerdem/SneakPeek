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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const product_svc_options_1 = require("../product-svc.options");
const error_handler_1 = require("../../../exceptions/error-handler");
const rxjs_1 = require("rxjs");
let ReviewService = class ReviewService {
    productReviewService;
    productClient;
    onModuleInit() {
        this.productReviewService = this.productClient.getService('ProductReviewService');
        if (!this.productReviewService) {
            console.error("Failed to connect productService");
        }
    }
    async addReview(review) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productReviewService.AddReview(review));
            return response;
        }
        catch (err) {
            console.log(err);
            (0, error_handler_1.handleMappedError)("REVIEW_ADD_FAILED");
        }
    }
    async getReviewsById(review) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productReviewService.GetReviewsByProductId(review));
            return response;
        }
        catch (err) {
            console.log(err);
            (0, error_handler_1.handleMappedError)("REVIEW_GET_FAILED");
        }
    }
    async deleteReviewById(review) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productReviewService.DeleteReview(review));
            return response;
        }
        catch (err) {
            console.log(err);
            (0, error_handler_1.handleMappedError)("REVIEW_DELETE_FAILED");
        }
    }
};
exports.ReviewService = ReviewService;
__decorate([
    (0, microservices_1.Client)(product_svc_options_1.ProductBaseClientOptions),
    __metadata("design:type", Object)
], ReviewService.prototype, "productClient", void 0);
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)()
], ReviewService);
//# sourceMappingURL=product-review.service.js.map