import { Module } from '@nestjs/common';
import { ReviewService } from './review.service'; // ReviewService'ı import et
import { ReviewController } from './review.controller'; // ReviewController'ı import et

@Module({
  imports: [],
  providers: [ReviewService],  // ReviewService'ı providers dizisine ekle
  controllers: [ReviewController],  // ReviewController'ı controllers dizisine ekle
})
export class ReviewModule {}