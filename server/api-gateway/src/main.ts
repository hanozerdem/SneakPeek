import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable cors because we want to our frontend access to the server
  app.enableCors({
    origin: ['http://localhost:3000','http://localhost:3001'], 
    credentials: true, 
  });

  // we have to use localhost/5000/api for requesting because 
  // our prefix is /api
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  // Validation pipe with class-transformer and class-validator libraries
  // actualy just for dto pattern
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: false
      }
    }),
  );
  

  // We want to sure that our process.env is available 
  console.log(configService.get<number>('PORT'));
  await app.listen(process.env.PORT ?? 6000);
  Logger.log(`API Gateway is running on http://localhost/${process.env.PORT}`);
}
bootstrap();

