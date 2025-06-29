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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const error_handler_1 = require("../../exceptions/error-handler");
const order_svc_options_1 = require("./order-svc.options");
let OrderService = class OrderService {
    orderService;
    orderServiceClient;
    onModuleInit() {
        this.orderService = this.orderServiceClient.getService('OrderService');
        if (!this.orderService) {
            console.error("Failed to connect to OrderService");
        }
    }
    async createOrder(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.CreateOrder(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ORDER_CREATION_FAILED");
        }
    }
    async updateOrderStatus(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.UpdateOrderStatus(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ORDER_UPDATE_FAILED");
        }
    }
    async requestRefund(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.RequestRefund(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ORDER_REFUND_FAILED");
        }
    }
    async getOrderHistory(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.GetOrderHistory(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ORDER_HISTORY_FAILED");
        }
    }
    async getOrderStatus(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.GetOrderStatus(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ORDER_STATUS_FAILED");
        }
    }
    async getOrderById(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.GetOrderById(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("ORDER_FIND_FAILED");
        }
    }
    async getAllRefundRequests() {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.GetAllRefunds({}));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("REFUND_LIST_FAILED");
        }
    }
    async changeRefundStatus(data) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.orderService.ChangeRefundStatus(data));
            return response;
        }
        catch (err) {
            console.error(err);
            (0, error_handler_1.handleMappedError)("REFUND_UPDATE_FAILED");
        }
    }
};
exports.OrderService = OrderService;
__decorate([
    (0, microservices_1.Client)(order_svc_options_1.OrderClientOptions),
    __metadata("design:type", Object)
], OrderService.prototype, "orderServiceClient", void 0);
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)()
], OrderService);
//# sourceMappingURL=order.service.js.map