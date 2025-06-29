"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
exports.handleMappedError = handleMappedError;
const common_1 = require("@nestjs/common");
const custom_exceptions_1 = require("./custom-exceptions");
const error_types_1 = require("./error-types");
function handleError(error) {
    if (error instanceof common_1.HttpException || error instanceof custom_exceptions_1.CustomError) {
        throw error;
    }
    throw new custom_exceptions_1.CustomError(error?.message ?? "An unknown error occurred");
}
function handleMappedError(error) {
    if (typeof error !== "string") {
        handleError(error);
    }
    const matchedError = Object.keys(error_types_1.ErrorType).find(key => error.includes(key));
    if (matchedError && error_types_1.ErrorType[matchedError]) {
        const { status, message, type } = error_types_1.ErrorType[matchedError];
        throw new type(status, message);
    }
    throw new custom_exceptions_1.CustomError(error ?? "An unexpected error occurred");
}
//# sourceMappingURL=error-handler.js.map