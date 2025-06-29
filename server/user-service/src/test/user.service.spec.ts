import { Model } from "mongoose";
import { User, UserDocument } from "../models/user.model";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../providers/user.service";


describe("UserService", () => {
  let userService: UserService;
  let userModel: Partial<Model<UserDocument>>;
  let jwtService: Partial<JwtService>;

  beforeEach(() => {
    // Mongoose model metotlarını mockluyoruz
    userModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    // UserService'i mocklanmış bağımlılıklarla örnekliyoruz.
    userService = new UserService(userModel as Model<UserDocument>, jwtService as JwtService);
  });

  describe("register", () => {
    it("başarılı kayıt: yeni kullanıcı için", async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      // Yeni oluşturulan kullanıcı örneğini simüle ediyoruz.
      const saveMock = jest.fn().mockResolvedValue({});
      const fakeUser = {
        save: saveMock,
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
        role: "customer",
        wishlist: [] as number[],
        cart: [] as number[],
      };

      // Kullanıcı oluşturulurken kullanılan constructor'u mockluyoruz.
      const mockUserConstructor = jest.fn(() => fakeUser);
      // Service içerisindeki userModel'i constructor fonksiyonu gibi davranacak şekilde değiştiriyoruz.
      userService["userModel"] = Object.assign(mockUserConstructor, userModel) as unknown as Model<UserDocument>;

      // bcrypt.hashSync için mock dönüş değeri
      jest.spyOn(bcrypt, "hashSync").mockReturnValue("hashedPassword");

      const input = {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword",
        wishlist: [] as number[],
        cart: [] as number[],
      };

      const result = await userService.register(input);
      expect(result.status).toBe(true);
      expect(result.message).toContain("registered successfully");
      expect(mockUserConstructor).toHaveBeenCalledWith({
        username: input.username,
        email: input.email,
        password: "hashedPassword",
        role: "customer",
        wishlist: input.wishlist,
        cart: input.cart,
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it("hata: email zaten mevcut", async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue({ email: "duplicate@example.com", username: "anotheruser" });
      const input = {
        username: "testuser",
        email: "duplicate@example.com",
        password: "testpassword",
        wishlist: [] as number[],
        cart: [] as number[],
      };

      const result = await userService.register(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Email already exists!");
    });

    it("hata: username zaten mevcut", async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue({ email: "other@example.com", username: "testuser" });
      const input = {
        username: "testuser",
        email: "unique@example.com",
        password: "testpassword",
        wishlist: [] as number[],
        cart: [] as number[],
      };

      const result = await userService.register(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Username already exists!");
    });

    it("edge-case: DB hatası oluştuğunda", async () => {
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));
      const input = {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword",
        wishlist: [] as number[],
        cart: [] as number[],
      };

      const result = await userService.register(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Register user error!");
    });
  });

  describe("login", () => {
    it("başarılı login: doğru kimlik bilgileri", async () => {
      const fakeUser = { _id: "123", password: "hashedPassword", role: "customer" };
      (userModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
      // bcrypt.compare için async mock implementation
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);
      (jwtService.sign as jest.Mock).mockReturnValue("token123");

      const input = { email: "test@example.com", password: "testpassword" };
      const result = await userService.login(input);
      expect(result.status).toBe(true);
      expect(result.message).toBe("Login successful");
      expect(result.token).toBe("token123");
    });

    it("hata: kullanıcı bulunamadığında", async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      const input = { email: "nonexistent@example.com", password: "testpassword" };
      const result = await userService.login(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Invalid credentials");
    });

    it("hata: yanlış şifre", async () => {
      const fakeUser = { _id: "123", password: "hashedPassword", role: "customer" };
      (userModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);
      const input = { email: "test@example.com", password: "wrongpassword" };
      const result = await userService.login(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Invalid credentials");
    });

    it("edge-case: login sırasında DB hatası", async () => {
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));
      const input = { email: "error@example.com", password: "testpassword" };
      const result = await userService.login(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Login user error");
    });
  });

  describe("update", () => {
    it("başarılı update: kullanıcı bilgileri güncelleniyor", async () => {
      const fakeUser = {
        _id: "123",
        username: "olduser",
        email: "old@example.com",
        password: "oldhashed",
        wishlist: [1, 2] as number[],
        cart: [3, 4] as number[],
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      // bcrypt.hash için async mock implementation kullanıyoruz.
      jest.spyOn(bcrypt, "hash").mockImplementation(async (data: string, salt: number) => "newhashed");

      const input = {
        userId: "123",
        username: "newuser",
        email: "new@example.com",
        password: "newpassword",
        wishlist: [5, 6] as number[],
        cart: [7, 8] as number[],
      };
      const result = await userService.update(input);

      expect(fakeUser.username).toBe("newuser");
      expect(fakeUser.email).toBe("new@example.com");
      expect(fakeUser.password).toBe("newhashed");
      expect(fakeUser.wishlist).toEqual([5, 6]);
      expect(fakeUser.cart).toEqual([7, 8]);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result.status).toBe(true);
      expect(result.message).toBe("User updated successfully!");
    });

    it("hata: update için kullanıcı bulunamazsa", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      const input = { userId: "nonexistent", username: "newuser" };
      const result = await userService.update(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("User not found!");
    });

    it("edge-case: update sırasında save hatası", async () => {
      const fakeUser = {
        _id: "123",
        username: "olduser",
        email: "old@example.com",
        password: "oldhashed",
        wishlist: [] as number[],
        cart: [] as number[],
        save: jest.fn().mockRejectedValue(new Error("Save error")),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input = { userId: "123", username: "newuser" };
      const result = await userService.update(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Update user error!");
    });

    it("edge-case: update sadece userId ile (güncelleme yapılmayacak)", async () => {
      const fakeUser = {
        _id: "123",
        username: "olduser",
        email: "old@example.com",
        password: "oldhashed",
        wishlist: [] as number[],
        cart: [] as number[],
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      const input = { userId: "123" };
      const result = await userService.update(input);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result.status).toBe(true);
      expect(result.message).toBe("User updated successfully!");
    });
  });

  describe("delete", () => {
    it("başarılı delete: kullanıcı siliniyor", async () => {
      const fakeUser = { _id: "123" };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      (userModel.findByIdAndDelete as jest.Mock).mockResolvedValue(fakeUser);

      const input = { userId: "123" };
      const result = await userService.delete(input);
      expect(result.status).toBe(true);
      expect(result.message).toBe("User deleted successfully!");
    });

    it("hata: delete için kullanıcı bulunamazsa", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      const input = { userId: "nonexistent" };
      const result = await userService.delete(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("User not found!");
    });

    it("edge-case: delete sırasında DB hatası", async () => {
      const fakeUser = { _id: "123" };
      (userModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      (userModel.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error("Delete error"));

      const input = { userId: "123" };
      const result = await userService.delete(input);
      expect(result.status).toBe(false);
      expect(result.message).toBe("Delete user error!");
    });
  });
});
