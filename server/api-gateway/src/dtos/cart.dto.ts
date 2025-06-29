import { IsNumber, IsString } from "class-validator";

export class AddItemToCartDto {
    @IsNumber()
    productId: number;

    @IsString()
    size: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;
}

export class RemoveItemFromCartDto {
    @IsNumber()
    productId: number;

    @IsString()
    size: string;
}

export class UpdateCartItemtDto {
    @IsNumber()
    productId: number;

    @IsString()
    size: string;

    @IsNumber()
    quantity: number;
}