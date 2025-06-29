import { Module } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { WishlistController } from "./wishlist.controller";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "src/guards/auth.guard";
import { ProductModule } from "../product/product.module";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: {expiresIn: '1h'},
          }),

          ProductModule,
    ],
    controllers: [WishlistController],
    providers: [WishlistService,AuthGuard],
    exports: [WishlistService]
})
export class WishlistModule {}
