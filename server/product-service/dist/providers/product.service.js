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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("../entities/product.entity");
const common_2 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
const product_size_entity_1 = require("../entities/product-size.entity");
let ProductService = class ProductService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    productSizeRepository;
    async create(productData) {
        try {
            const newProduct = this.productRepository.create(productData);
            const savedProduct = await this.productRepository.save(newProduct);
            return {
                status: true,
                message: 'Product is created successfully!',
                productId: savedProduct.productID,
            };
        }
        catch (err) {
            console.error(err);
            return {
                status: false,
                message: 'Failed to create product: ' + err.message,
                productId: -1,
            };
        }
    }
    async findAll() {
        try {
            const products = await this.productRepository.find({
                relations: ['sizes', 'prices', 'reviews'],
            });
            if (!products) {
                return {
                    status: false,
                    message: 'An error during getting all products',
                    products: [],
                };
            }
            return {
                status: true,
                message: 'Products fetched successfully!',
                products: products.map((product) => ({
                    productId: product.productID,
                    productName: product.productName,
                    model: product.model,
                    brand: product.brand,
                    serialNumber: product.serialNumber,
                    price: product.price,
                    currency: product.currency,
                    warrantyStatus: product.warrantyStatus,
                    distributor: product.distributor,
                    description: product.description,
                    color: product.color,
                    category: product.category,
                    tags: product.tags,
                    sizes: product.sizes.map((size) => ({
                        sizeId: size.sizeID,
                        size: size.size,
                        quantity: size.quantity,
                    })),
                    prices: product.prices.map((price) => ({
                        pricingId: price.pricingID,
                        priceType: price.priceType,
                        price: price.price,
                        currency: price.currency,
                    })),
                    reviews: product.reviews.map((review) => ({
                        reviewId: review.reviewID,
                        userId: review.userID,
                        reviewText: review.reviewText,
                        rating: review.rating,
                        createdAt: review.createdAt.toISOString(),
                    })),
                    rating: product.rating,
                })),
            };
        }
        catch (err) {
            console.error(err);
            return {
                status: false,
                message: 'Product not found!',
                products: [],
            };
        }
    }
    async getProductById(id) {
        try {
            const productId = id.productId;
            const product = await this.productRepository.findOne({
                where: { productID: productId },
            });
            if (!product) {
                return {
                    status: false,
                    message: 'Product not found!',
                };
            }
            return {
                status: true,
                message: 'Product fetcehd successfully!',
                ...product,
            };
        }
        catch (err) {
            console.error(err);
            return {
                status: false,
                message: 'Failedd to get product by id!',
            };
        }
    }
    async updateProduct(product) {
        try {
            const { productId, ...updateFields } = product;
            console.log('productId ' + productId);
            console.log(updateFields);
            const existingProduct = await this.productRepository.findOne({
                where: { productID: productId },
            });
            if (!existingProduct) {
                return {
                    status: false,
                    message: 'Product not found!',
                };
            }
            await this.productRepository.update({ productID: productId }, updateFields);
            return {
                status: true,
                message: 'Product updated successfully!',
            };
        }
        catch (err) {
            console.error(err);
            return {
                status: false,
                message: 'There is an error occured to try to update product',
            };
        }
    }
    async deleteProduct(productId) {
        try {
            const id = productId.productId;
            const existingProduct = await this.productRepository.findOne({
                where: { productID: id },
            });
            if (!existingProduct) {
                return {
                    status: false,
                    message: 'Product not found!',
                };
            }
            await this.productRepository.delete({ productID: id });
            return {
                status: true,
                message: 'Product deleted successfully!',
            };
        }
        catch (err) {
            console.error(err);
            return {
                status: false,
                message: 'There was an error while deleting the product: ' + err.message,
            };
        }
    }
    async getProductStock(productId) {
        const product = await this.productRepository.findOne({
            where: { productID: productId },
            relations: ['sizes'],
        });
        if (!product) {
            throw new common_2.NotFoundException(`Product with ID ${productId} not found`);
        }
        return product.totalStock;
    }
    async checkStockBeforeAdding(productId, quantity) {
        const stock = await this.getProductStock(productId);
        if (stock < quantity) {
            throw new common_2.BadRequestException(`Only ${stock} items available in stock`);
        }
    }
    async decreaseStockAfterPurchase(productId, quantity) {
        const product = await this.productRepository.findOne({
            where: { productID: productId },
            relations: ['sizes'],
        });
        if (!product) {
            throw new common_2.NotFoundException(`Product with ID ${productId} not found`);
        }
        let remaining = quantity;
        for (const size of product.sizes) {
            if (remaining <= 0)
                break;
            const deduct = Math.min(size.quantity, remaining);
            size.quantity -= deduct;
            remaining -= deduct;
            await this.productSizeRepository.save(size);
        }
        if (remaining > 0) {
            throw new common_2.BadRequestException(`Not enough stock to fulfill the purchase`);
        }
    }
};
exports.ProductService = ProductService;
__decorate([
    (0, typeorm_1.InjectRepository)(product_size_entity_1.ProductSize),
    __metadata("design:type", typeorm_2.Repository)
], ProductService.prototype, "productSizeRepository", void 0);
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductService);
//# sourceMappingURL=product.service.js.map