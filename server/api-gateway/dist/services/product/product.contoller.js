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
exports.ProductController = void 0;
const error_handler_1 = require("../../exceptions/error-handler");
const product_base_service_1 = require("./product-base.service");
const common_1 = require("@nestjs/common");
const product_base_dto_1 = require("../../dtos/product-base.dto");
const product_review_service_1 = require("./reviews/product-review.service");
const auth_guard_1 = require("../../guards/auth.guard");
let ProductController = class ProductController {
    productService;
    reviewService;
    constructor(productService, reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }
    async createProduct(product) {
        try {
            return await this.productService.createProduct(product);
        }
        catch (err) {
            (0, error_handler_1.handleError)(err);
        }
    }
    async getAllProducts() {
        try {
            return this.productService.getAllProducts();
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async getProductById(id) {
        try {
            return await this.productService.getProductById({ productId: id });
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async updateProduct(id, updateProductDto) {
        try {
            if (Object.keys(updateProductDto).length === 0) {
                return {
                    status: false,
                    message: 'No fields provided for update.',
                };
            }
            return await this.productService.updateProduct({
                ...updateProductDto,
                productId: id,
            });
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async deleteProduct(id) {
        try {
            return await this.productService.deleteProduct({ productId: id });
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async addReview(req, body) {
        try {
            const userId = req.user.id;
            const review = {
                reviewText: body.reviewText,
                productId: body.productId,
                rating: body.rating,
                userId: userId,
            };
            return await this.reviewService.addReview(review);
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async getReviewsById(id) {
        try {
            return await this.reviewService.getReviewsById({ productId: id });
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async deleteReviewById(id) {
        try {
            return await this.reviewService.deleteReviewById({ reviewId: id });
        }
        catch (err) {
            (0, error_handler_1.handleMappedError)(err);
        }
    }
    async addSizeToProduct(data) {
        return await this.productService.addSizeToProduct(data);
    }
    async addPriceToProduct(data) {
        return await this.productService.addPriceToProduct(data);
    }
    async isProductAvailableInSize(productId, size) {
        const data = { productId, size };
        return await this.productService.isProductAvailableInSize(data);
    }
    async getProductStock(productId) {
        const data = { productId };
        return await this.productService.getProductStock(data);
    }
    async checkStockBeforeAdding(productId, quantity) {
        const data = { productId, quantity };
        return await this.productService.checkStockBeforeAdding(data);
    }
    async decreaseStockAfterPurchase(productId, quantity) {
        const data = { productId, quantity };
        return await this.productService.decreaseStockAfterPurchase(data);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)('/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_base_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Put)('/update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, product_base_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('/delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)('/review/add'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, product_base_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addReview", null);
__decorate([
    (0, common_1.Get)('/review/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getReviewsById", null);
__decorate([
    (0, common_1.Delete)('/review/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteReviewById", null);
__decorate([
    (0, common_1.Post)('/size'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addSizeToProduct", null);
__decorate([
    (0, common_1.Post)('/price'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "addPriceToProduct", null);
__decorate([
    (0, common_1.Get)('/:productId/size/:size/availability'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Param)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "isProductAvailableInSize", null);
__decorate([
    (0, common_1.Get)('/:productId/stock'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductStock", null);
__decorate([
    (0, common_1.Post)('/:productId/stock/check'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "checkStockBeforeAdding", null);
__decorate([
    (0, common_1.Post)('/:productId/stock/decrease'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "decreaseStockAfterPurchase", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_base_service_1.ProductService,
        product_review_service_1.ReviewService])
], ProductController);
//# sourceMappingURL=product.contoller.js.map