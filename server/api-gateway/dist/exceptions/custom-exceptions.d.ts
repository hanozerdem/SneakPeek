import { HttpException } from "@nestjs/common";
export declare class CustomError extends Error {
    constructor(message: string);
}
export declare class HttpError extends HttpException {
    constructor(status: number, message: string);
}
