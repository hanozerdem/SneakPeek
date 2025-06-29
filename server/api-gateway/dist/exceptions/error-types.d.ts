import { HttpStatus } from "@nestjs/common";
import { CustomError, HttpError } from "./custom-exceptions";
export declare const ErrorType: {
    REGISTER_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    LOGIN_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    UPDATE_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    DELETE_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    PRODUCT_FIND_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    GET_PRODUCTS_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    PRODUCT_UPDATE_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    PRODUCT_DELETE_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    PRODUCT_CREATION_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    REVIEW_ADD_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    REVIEW_GET_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    REVIEW_DELETE_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ADD_TO_WISHLIST_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    GET_WISHLIST_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    REMOVE_FROM_WISHLIST_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    NO_TOKEN_PROVIDED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    TOKEN_EXPIRED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    INVALID_TOKEN: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    PERMISSION_DENIED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ORDER_CREATION_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ORDER_UPDATE_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ORDER_REFUND_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ORDER_HISTORY_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ORDER_STATUS_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    ORDER_FIND_FAILED: {
        status: HttpStatus;
        message: string;
        type: typeof HttpError;
    };
    UNKNOWN: {
        status: HttpStatus;
        message: string;
        type: typeof CustomError;
    };
};
