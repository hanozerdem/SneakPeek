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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const product_service_1 = require("../providers/product.service");
const review_service_1 = require("../providers/review.service");
let ProductController = class ProductController {
    productService;
    reviewService;
    constructor(productService, reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }
    onModuleInit() {
        console.log('Product service grpc is running!');
    }
    async createProduct(product) {
        try {
            if (!product) {
                console.error('ERROR: Missing parameters!', product);
                return { status: false, message: 'Missing required parameters!' };
            }
            const response = await this.productService.create(product);
            return response;
        }
        catch (err) {
            return { status: false, message: 'An error occured during the create product method!' };
        }
    }
    async GetAllProducts() {
        try {
            const response = await this.productService.findAll();
            return response;
        }
        catch (err) {
            console.error(err);
            return {
                status: false,
                message: "An error during getting all products",
                products: []
            };
        }
    }
    async GetProductById(productId) {
        try {
            if (!productId || Object.keys(productId).length === 0) {
                console.error('ERROR: Missing parameters!', productId);
                return { status: false, message: 'Missing required parameters!' };
            }
            const response = await this.productService.getProductById(productId);
            return response;
        }
        catch (err) {
            return { status: false, message: 'An error occured during the get product by id method!' };
        }
    }
    async UpdateProduct(product) {
        try {
            if (!product) {
                console.error('ERROR: Missing parameters!', product);
                return { status: false, message: 'Missing required parameters!' };
            }
            const response = await this.productService.updateProduct(product);
            return response;
        }
        catch (err) {
            return { status: false, message: 'An error occured during the update product method!' };
        }
    }
    async DeleteProduct(productId) {
        try {
            if (!productId) {
                console.error('ERROR: Missing parameters!', productId);
                return { status: false, message: 'Missing required parameters!' };
            }
            const response = await this.productService.deleteProduct(productId);
            return response;
        }
        catch (err) {
            return { status: false, message: 'An error occured during the delete product method!' };
        }
    }
    async AddReview(review) {
        try {
            const response = await this.reviewService.addReview(review);
            return response;
        }
        catch (err) {
            console.error("Error in AddReview:", err);
            return { status: false, message: 'An error occured during add a new review!' };
        }
    }
    async GetReviews(review) {
        try {
            const response = await this.reviewService.getReviewsByProductId(review);
            return response;
        }
        catch (err) {
            console.error("Error in GetReviewsByProductId:", err);
            return { status: false, message: 'An error occured when getting reviews method!' };
        }
    }
    async DeleteReview(review) {
        try {
            const response = await this.reviewService.deleteReview(review);
            return response;
        }
        catch (err) {
            console.error("Error in DeleteReview:", err);
            return { status: false, message: 'An error occured during delete the review by giving product id!' };
        }
    }
    async GetProductStock(request) {
        try {
            const stock = await this.productService.getProductStock(request.productId);
            return { status: true, message: 'Stock fetched successfully!', stock };
        }
        catch (err) {
            return { status: false, message: 'An error occurred during get product stock method!' };
        }
    }
    async CheckStockBeforeAdding(request) {
        try {
            await this.productService.checkStockBeforeAdding(request.productId, request.quantity);
            return { status: true, message: 'Stock is sufficient' };
        }
        catch (err) {
            return { status: false, message: err.message || 'Not enough stock available' };
        }
    }
    async DecreaseStockAfterPurchase(request) {
        try {
            await this.productService.decreaseStockAfterPurchase(request.productId, request.quantity);
            return { status: true, message: 'Stock decreased successfully!' };
        }
        catch (err) {
            return { status: false, message: 'An error occurred during decrease stock method!' };
        }
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'CreateProduct'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createProduct", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'GetAllProducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "GetAllProducts", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'GetProductById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "GetProductById", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'UpdateProduct'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "UpdateProduct", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'DeleteProduct'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "DeleteProduct", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductReviewService', 'AddReview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "AddReview", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductReviewService', 'GetReviewsByProductId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "GetReviews", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductReviewService', 'DeleteReview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "DeleteReview", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'GetProductStock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "GetProductStock", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'CheckStockBeforeAdding'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "CheckStockBeforeAdding", null);
__decorate([
    (0, microservices_1.GrpcMethod)('ProductBaseService', 'DecreaseStockAfterPurchase'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "DecreaseStockAfterPurchase", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        review_service_1.ReviewService])
], ProductController);
//# sourceMappingURL=product.controller.js.map