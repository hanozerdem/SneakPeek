"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = void 0;
const common_1 = require("@nestjs/common");
const custom_exceptions_1 = require("./custom-exceptions");
exports.ErrorType = {
    REGISTER_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "User registration failed. Please check your details and try again.",
        type: custom_exceptions_1.HttpError,
    },
    LOGIN_FAILED: {
        status: common_1.HttpStatus.UNAUTHORIZED,
        message: "Login attempt failed. Invalid credentials provided.",
        type: custom_exceptions_1.HttpError,
    },
    UPDATE_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "User update failed. Please verify the input data.",
        type: custom_exceptions_1.HttpError,
    },
    DELETE_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "User deletion failed. The user may not exist.",
        type: custom_exceptions_1.HttpError,
    },
    PRODUCT_FIND_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "No product found for the given ID.",
        type: custom_exceptions_1.HttpError,
    },
    GET_PRODUCTS_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "Failed to get all products",
        type: custom_exceptions_1.HttpError,
    },
    PRODUCT_UPDATE_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Product update failed. Ensure valid data is provided.",
        type: custom_exceptions_1.HttpError,
    },
    PRODUCT_DELETE_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "Product deletion failed. The product may not exist.",
        type: custom_exceptions_1.HttpError,
    },
    PRODUCT_CREATION_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Failed to create the product. Please check input data.",
        type: custom_exceptions_1.HttpError,
    },
    REVIEW_ADD_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Failed to add a review. Please ensure valid product ID and rating.",
        type: custom_exceptions_1.HttpError,
    },
    REVIEW_GET_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "No reviews found for the given product ID.",
        type: custom_exceptions_1.HttpError,
    },
    REVIEW_DELETE_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "Review deletion failed. The review may not exist.",
        type: custom_exceptions_1.HttpError,
    },
    ADD_TO_WISHLIST_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Failed to add product to wishlist. Please try again.",
        type: custom_exceptions_1.HttpError,
    },
    GET_WISHLIST_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Failed to get products from wishlist. Please try again.",
        type: custom_exceptions_1.HttpError,
    },
    REMOVE_FROM_WISHLIST_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Failed to remove product from wishlist. Please try again.",
        type: custom_exceptions_1.HttpError,
    },
    NO_TOKEN_PROVIDED: {
        status: common_1.HttpStatus.UNAUTHORIZED,
        message: "Access denied. No authentication token provided.",
        type: custom_exceptions_1.HttpError,
    },
    TOKEN_EXPIRED: {
        status: common_1.HttpStatus.UNAUTHORIZED,
        message: "Session expired. Please refresh your authentication token.",
        type: custom_exceptions_1.HttpError,
    },
    INVALID_TOKEN: {
        status: common_1.HttpStatus.UNAUTHORIZED,
        message: "Authentication failed. Invalid token provided.",
        type: custom_exceptions_1.HttpError,
    },
    PERMISSION_DENIED: {
        status: common_1.HttpStatus.FORBIDDEN,
        message: "Access denied. You do not have the required permissions.",
        type: custom_exceptions_1.HttpError,
    },
    ORDER_CREATION_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Order creation failed. Please verify the order details.",
        type: custom_exceptions_1.HttpError,
    },
    ORDER_UPDATE_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Failed to update the order status. Please check the provided status.",
        type: custom_exceptions_1.HttpError,
    },
    ORDER_REFUND_FAILED: {
        status: common_1.HttpStatus.BAD_REQUEST,
        message: "Refund request failed. Please ensure the order and user are valid.",
        type: custom_exceptions_1.HttpError,
    },
    ORDER_HISTORY_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "Could not retrieve the order history for the given user.",
        type: custom_exceptions_1.HttpError,
    },
    ORDER_STATUS_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "Could not retrieve the status for the given order.",
        type: custom_exceptions_1.HttpError,
    },
    ORDER_FIND_FAILED: {
        status: common_1.HttpStatus.NOT_FOUND,
        message: "Order not found for the given ID.",
        type: custom_exceptions_1.HttpError,
    },
    UNKNOWN: {
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An unexpected system error occurred. Please try again later.",
        type: custom_exceptions_1.CustomError,
    },
};
//# sourceMappingURL=error-types.js.map