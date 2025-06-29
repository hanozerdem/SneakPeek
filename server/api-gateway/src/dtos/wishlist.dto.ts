import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

/* ------------------ ADD PRODUCT TO WISHLIST DTO ------------------ */
export class AddProductToWishlistDto {
  @IsInt()
  @Min(1) // Product ID is non-negative
  productId: number;
}

export class RemoveProductFromWishlistDto {
  @IsInt()
  @Min(1) // Product ID is non-negative
  productId: number;
}


/* ------------------ GET USER WISHLIST DTO ------------------ */
export class GetUserWishlistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
