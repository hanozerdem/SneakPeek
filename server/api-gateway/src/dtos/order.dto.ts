import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsPositive,
  Min,
  IsNotEmpty,
  IsInt,
  ValidateNested,
  IsEnum,
  IsBoolean
} from 'class-validator';

// -----------------------------
// ORDER ITEM (Sub-DTO)
// -----------------------------

export class OrderItemDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  productId: number;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

// -----------------------------
// CREATE ORDER
// -----------------------------

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  cardInformation: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

// -----------------------------
// UPDATE STATUS
// -----------------------------

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  newStatus: string;
}

// -----------------------------
// REQUEST REFUND
// -----------------------------

export class RequestRefundDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ChangeRefundStatusDto {
  @IsNotEmpty()
  @IsString()
  refundId: string;

  @IsNotEmpty()
  @IsString()
  refundStatus: string;
}
// -----------------------------
// Canel Order
// -----------------------------

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}