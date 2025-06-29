import {ArrayMinSize, IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, Length, Matches, Min} from 'class-validator'
import {Transform, Type} from 'class-transformer';

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Username is required' })
    @Length(3,20, {message: 'Username must be between 3 and 20 characters'})
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'Username can only contain letters and numbers' })
    username: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    @Transform(({ value }) => value.toLowerCase().trim()) 
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        })
    password: string;

    @IsArray({ message: 'Wishlist must be an array' })
    @IsInt({ each: true, message: 'Each wishlist item must be an integer' })
    @Type(() => Number) 
    wishlist: number[];

    @IsArray({ message: 'Cart must be an array' })
    @IsInt({ each: true, message: 'Each cart item must be an integer' })
    @Type(() => Number) 
    cart: number[];
}

export class LoginUserDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    @Transform(({ value }) => value.toLowerCase().trim()) 
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        })
    password: string;
}


export class UpdateUserDto {
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;

    @IsOptional()
    @Length(3, 20, { message: 'Username must be between 3 and 20 characters' })
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'Username can only contain letters and numbers' })
    username?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    @Transform(({ value }) => value.toLowerCase().trim())
    email?: string;

    @IsOptional()
    @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password?: string;

    @IsOptional()
    @IsArray({ message: 'Wishlist must be an array' })
    @IsInt({ each: true, message: 'Each wishlist item must be an integer' })
    @Type(() => Number)
    wishlist?: number[];

    @IsOptional()
    @IsArray({ message: 'Cart must be an array' })
    @IsInt({ each: true, message: 'Each cart item must be an integer' })
    @Type(() => Number)
    cart?: number[];
}


export class DeleteUserDto {
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;
}