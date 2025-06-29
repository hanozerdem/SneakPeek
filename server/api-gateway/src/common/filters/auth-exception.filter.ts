import { ArgumentsHost, Catch, ExceptionFilter, BadRequestException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    let messages: string[] = [];
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
      messages = Array.isArray((exceptionResponse as any).message)
        ? (exceptionResponse as any).message
        : [(exceptionResponse as any).message];
    }

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      status: false,
      message: messages[0], 
    });
  }
}
