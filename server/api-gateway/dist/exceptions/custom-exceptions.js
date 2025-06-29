"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = exports.CustomError = void 0;
const common_1 = require("@nestjs/common");
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}
exports.CustomError = CustomError;
class HttpError extends common_1.HttpException {
    constructor(status, message) {
        super({ statusCode: status, message }, status);
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=custom-exceptions.js.map