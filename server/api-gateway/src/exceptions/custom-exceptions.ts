import { HttpException, HttpStatus } from "@nestjs/common";

// General Custom Error Class
export class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
    }
}


// HTTP exception error class
export class HttpError extends HttpException {
    constructor(status: number, message: string) {
        super({ statusCode: status, message }, status);
    }
}

