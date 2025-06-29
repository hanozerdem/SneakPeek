import { IsString, IsNumber, IsOptional, IsArray, IsPositive, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  productName: string;

  @IsString()
  model: string;

  @IsString()
  brand: string;

  @IsString()
  serialNumber: string;

  //It is optional because it can be 0 or null by product manager, sales manager will set it later
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
//Same as above.
  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  warrantyStatus: string;

  @IsString()
  distributor: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}


export class UpdateProductDto {

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  warrantyStatus?: string;

  @IsOptional()
  @IsString()
  distributor?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  tags?: string[];
  @IsOptional()
  @IsString()
  currentPriceType?: string;

}



export class CreateReviewDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsString()
  reviewText?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
export class ApproveReviewDto {
  reviewId: string;
}

export class RejectReviewDto {
  reviewId: string;
}
