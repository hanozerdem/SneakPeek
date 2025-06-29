import { HttpException } from "@nestjs/common";
import { CustomError } from "./custom-exceptions";
import { ErrorType } from "./error-types";  // ErrorType object containing predefined error mappings

// General error handling function
export function handleError(error: any): never {
    // If the error is already an instance of HttpException or CustomError, throw it as is
    if (error instanceof HttpException || error instanceof CustomError) {
        throw error;
    }
    // Otherwise, wrap it in a CustomError and throw it
    throw new CustomError(error?.message ?? "An unknown error occurred");
}

// Error handling function for specific mapped errors
export function handleMappedError(error: string): never {
    // If the error is not a string, redirect it to the general error handler
    if (typeof error !== "string") {
        handleError(error);
    }

    // Check if the error string matches any predefined error keys in ErrorType
    const matchedError = Object.keys(ErrorType).find(key => error.includes(key));

    // If a match is found, throw the corresponding predefined error
    if (matchedError && ErrorType[matchedError]) {
        const { status, message, type } = ErrorType[matchedError];
        throw new type(status, message); // Dynamically create and throw the error instance
    }

    // If no match is found, throw a default CustomError
    throw new CustomError(error ?? "An unexpected error occurred");
}
