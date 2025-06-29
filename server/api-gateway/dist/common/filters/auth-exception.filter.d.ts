import { ArgumentsHost, ExceptionFilter, BadRequestException } from '@nestjs/common';
export declare class AuthExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost): void;
}
