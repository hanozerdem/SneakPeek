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
exports.WishlistService = void 0;
const microservices_1 = require("@nestjs/microservices");
const auth_svc_options_1 = require("../auth/auth-svc.options");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const error_handler_1 = require("../../exceptions/error-handler");
const product_base_service_1 = require("../product/product-base.service");
let WishlistService = class WishlistService {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    wishlistService;
    wishlistServiceClient;
    onModuleInit() {
        this.wishlistService = this.wishlistServiceClient.getService('WishlistService');
        if (!this.wishlistService) {
            console.error("Failed to connect to WishlistService");
        }
    }
    async addProductToWishlist(data) {
        try {
            const res = await this.productService.getProductById({ productId: data.productId });
            if (!res.status) {
                return {
                    status: false,
                    message: res.message,
                };
            }
            const response = await (0, rxjs_1.lastValueFrom)(this.wishlistService.AddProductToWishlist(data));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred",
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ADD_TO_WISHLIST_FAILED");
        }
    }
    async getProductFromWishlist(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.wishlistService.GetUserWishlist(data));
            return {
                status: response?.status ?? false,
                wishlist: response?.wishlist,
                message: response?.message ?? "Unknown error occurred",
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("GET_WISHLIST_FAILED");
        }
    }
    async removeProductFromWishlist(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.wishlistService.RemoveProductFromWishlist(data));
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred",
            };
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("REMOVE_FROM_WISHLIST_FAILED");
        }
    }
};
exports.WishlistService = WishlistService;
__decorate([
    (0, microservices_1.Client)(auth_svc_options_1.UserServiceClientOptions),
    __metadata("design:type", Object)
], WishlistService.prototype, "wishlistServiceClient", void 0);
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_base_service_1.ProductService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map