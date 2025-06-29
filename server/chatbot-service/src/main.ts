import { NestFactory } from '@nestjs/core';
import { ChatbotModule } from './chatbot.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(ChatbotModule);
  app.enableCors();
  await app.listen(50055);
  console.log(`🚀 Chatbot Microservice running at http://localhost:50055`);
}
bootstrap();
