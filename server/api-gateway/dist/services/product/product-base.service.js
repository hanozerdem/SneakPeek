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
exports.ProductService = void 0;
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const product_svc_options_1 = require("./product-svc.options");
const rxjs_1 = require("rxjs");
const error_handler_1 = require("../../exceptions/error-handler");
let ProductService = class ProductService {
    productBaseService;
    productBaseServiceClient;
    onModuleInit() {
        this.productBaseService =
            this.productBaseServiceClient.getService('ProductBaseService');
        if (!this.productBaseService) {
            console.error('Failed to connect productService');
        }
    }
    async createProduct(product) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.CreateProduct(product));
            return {
                status: response?.status ?? false,
                message: response?.message ?? 'Unknown error occured',
                productId: response?.productId ?? -1,
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_CREATION_FAILED');
        }
    }
    async getAllProducts() {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.GetAllProducts({}));
            return {
                status: response?.status ?? false,
                message: response?.message ?? 'Unknown error occured',
                products: response?.products ?? [],
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('GET_PRODUCTS_FAILED');
        }
    }
    async getProductById(productID) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.GetProductById(productID));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_FIND_FAILED');
        }
    }
    async updateProduct(product) {
        try {
            console.log(product);
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.UpdateProduct(product));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_UPDATE_FAILED');
        }
    }
    async deleteProduct(product) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.DeleteProduct(product));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_DELETE_FAILED');
        }
    }
    async addSizeToProduct(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.AddSizeToProduct(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_ADD_SIZE_FAILED');
        }
    }
    async addPriceToProduct(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.AddPriceToProduct(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_ADD_PRICE_FAILED');
        }
    }
    async isProductAvailableInSize(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.IsProductAvailableInSize(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_CHECK_SIZE_AVAILABILITY_FAILED');
        }
    }
    async getProductStock(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.GetProductStock(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_GET_STOCK_FAILED');
        }
    }
    async checkStockBeforeAdding(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.CheckStockBeforeAdding(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_CHECK_STOCK_FAILED');
        }
    }
    async decreaseStockAfterPurchase(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.productBaseService.DecreaseStockAfterPurchase(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)('PRODUCT_DECREASE_STOCK_FAILED');
        }
    }
};
exports.ProductService = ProductService;
__decorate([
    (0, microservices_1.Client)(product_svc_options_1.ProductBaseClientOptions),
    __metadata("design:type", Object)
], ProductService.prototype, "productBaseServiceClient", void 0);
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)()
], ProductService);
//# sourceMappingURL=product-base.service.js.map