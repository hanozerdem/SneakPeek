import { Model } from "mongoose";
import { WishlistService } from "../providers/wishlist.service";
import { WishlistRequest, GetUserWishlistRequest } from "../interfaces/wishlist.interface";
import { User, UserDocument } from "../models/user.model";

describe("WishlistService", () => {
  let wishlistService: WishlistService;
  let userModel: Partial<Model<UserDocument>>;

  beforeEach(() => {
    // Sadece findById metodunu kullanıyoruz çünkü WishlistService'de yalnızca bu metoda ihtiyaç var.
    userModel = {
      findById: jest.fn(),
    };

    wishlistService = new WishlistService(userModel as Model<UserDocument>);
  });

  describe("addProductToWishlist", () => {
    it("başarılı: ürün ekleniyor", async () => {
      // Fake kullanıcı, boş wishlist
      const fakeUser = {
        _id: "123",
        wishlist: [] as number[],
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);

      const input: WishlistRequest = {
        userId: "123",
        productId: "101" // geçerli sayı string'i => number 101
      };

      const result = await wishlistService.addProductToWishlist(input);
      expect(result.status).toBe(true);
      expect(result.message).toBe("Product added to wishlist successfully.");
      expect(fakeUser.wishlist).toContain(101);
      expect(fakeUser.save).toHaveBeenCalled();
    });

    it("hata: productId formatı geçersiz", async () => {
      const input: WishlistRequest = {
        userId: "123",
        productId: "abc"  // sayıya çevrilemeyen değer
      };

      const result = await wishlistService.addProductToWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Invalid productId format.");
    });

    it("hata: kullanıcı bulunamadığında", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      const input: WishlistRequest = {
        userId: "999",
        productId: "101"
      };

      const result = await wishlistService.addProductToWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("User not found.");
    });

    it("hata: ürün zaten wishlist'te", async () => {
      const fakeUser = {
        _id: "123",
        wishlist: [101] as number[],
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input: WishlistRequest = {
        userId: "123",
        productId: "101"
      };

      const result = await wishlistService.addProductToWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Product is already in the wishlist.");
    });

    it("edge-case: DB hatası sırasında", async () => {
      (userModel.findById as jest.Mock).mockRejectedValue(new Error("DB error"));
      const input: WishlistRequest = {
        userId: "123",
        productId: "101"
      };

      const result = await wishlistService.addProductToWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Internal server error.");
    });
  });

  describe("removeProductFromWishlist", () => {
    it("başarılı: ürün çıkarılıyor", async () => {
      const fakeUser = {
        _id: "123",
        wishlist: [101, 202] as number[],
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input: WishlistRequest = {
        userId: "123",
        productId: "101"
      };

      const result = await wishlistService.removeProductFromWishlist(input);
      expect(result.status).toBe(true);
      expect(result.message).toBe("Product removed from wishlist successfully.");
      expect(fakeUser.wishlist).not.toContain(101);
      expect(fakeUser.save).toHaveBeenCalled();
    });

    it("hata: productId formatı geçersiz", async () => {
      const input: WishlistRequest = {
        userId: "123",
        productId: "xyz"
      };
      const result = await wishlistService.removeProductFromWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Invalid productId format.");
    });

    it("hata: kullanıcı bulunamadığında", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      const input: WishlistRequest = {
        userId: "999",
        productId: "101"
      };
      const result = await wishlistService.removeProductFromWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("User not found.");
    });

    it("hata: ürün wishlist'te yoksa", async () => {
      const fakeUser = {
        _id: "123",
        wishlist: [202] as number[],
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input: WishlistRequest = {
        userId: "123",
        productId: "101" // listede bulunmuyor
      };
      const result = await wishlistService.removeProductFromWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Product is not in the wishlist.");
    });

    it("edge-case: DB hatası sırasında remove", async () => {
      const fakeUser = {
        _id: "123",
        wishlist: [101, 202] as number[],
        save: jest.fn().mockRejectedValue(new Error("Save error")),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input: WishlistRequest = {
        userId: "123",
        productId: "101"
      };
      const result = await wishlistService.removeProductFromWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Internal server error.");
    });
  });

  describe("getWishlist", () => {
    it("başarılı: kullanıcı wishlist'ini döndürüyor", async () => {
      const fakeUser = {
        _id: "123",
        wishlist: [101, 202] as number[],
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input: GetUserWishlistRequest = { userId: "123" };

      const result = await wishlistService.getWishlist(input);
      expect(result.status).toBe(true);
      expect(result.message).toBe("ok");
      expect(result.wishlist).toEqual(["101", "202"]);
    });

    it("hata: kullanıcı bulunamadığında", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      const input: GetUserWishlistRequest = { userId: "999" };

      const result = await wishlistService.getWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("User not found.");
    });

    it("edge-case: DB hatası sırasında getWishlist", async () => {
      (userModel.findById as jest.Mock).mockRejectedValue(new Error("DB error"));
      const input: GetUserWishlistRequest = { userId: "123" };

      const result = await wishlistService.getWishlist(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Internal server error.");
    });
  });
});
