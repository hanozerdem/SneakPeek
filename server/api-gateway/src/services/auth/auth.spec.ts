import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/interfaces/auth.interface';
import { ClientGrpc } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { handleError } from 'src/exceptions/error-handler';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { handleMappedError } from 'src/exceptions/error-handler';

const mockUserService = {
  register: jest.fn(),
  login: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserServiceClient = {
  getService: jest.fn().mockReturnValue(mockUserService),
};

jest.mock('src/exceptions/error-handler', () => ({
    handleError: jest.fn(),
    handleMappedError: jest.fn(),
  }));
  

describe('AuthService Unit Tests', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .overrideProvider('UserServiceClientOptions')
      .useValue(mockUserServiceClient)
      .compile();

    service = module.get<AuthService>(AuthService);
    Object.defineProperty(service, 'userServiceClient', {
      value: mockUserServiceClient as unknown as ClientGrpc,
      writable: false,
    });
    service.onModuleInit();
  });

  afterEach(() => jest.clearAllMocks());

  describe('register()', () => {
    it('should successfully register a user', async () => {
      mockUserService.register.mockReturnValueOnce(
        of({ status: true, message: 'User registered successfully' }),
      );

      const response = await service.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        wishlist: [],
        cart: [],
      });

      expect(response).toEqual({
        status: true,
        message: 'User registered successfully',
      });
    });

    it('should handle errors during registration', async () => {
      mockUserService.register.mockReturnValueOnce(throwError(() => new Error('gRPC error')));

      await service.register({
        username: 'erroruser',
        email: 'error@example.com',
        password: 'pass',
        wishlist: [],
        cart: [],
      });

      expect(handleMappedError).toHaveBeenCalledWith('REGISTER_FAILED');
    });
  });

  describe('login()', () => {
    it('should login successfully', async () => {
      mockUserService.login.mockReturnValueOnce(
        of({ status: true, message: 'Logged in', token: 'jwt-token' }),
      );

      const response = await service.login({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(response).toEqual({
        status: true,
        message: 'Logged in',
        token: 'jwt-token',
      });
    });

    it('should handle login failure', async () => {
      mockUserService.login.mockReturnValueOnce(throwError(() => new Error('Login error')));

      await service.login({
        email: 'wrong@example.com',
        password: 'wrong',
      });

      expect(handleMappedError).toHaveBeenCalledWith('LOGIN_FAILED');
    });
  });

  describe('update()', () => {
    it('should update user info successfully', async () => {
      mockUserService.update.mockReturnValueOnce(
        of({ status: true, message: 'User updated' }),
      );

      const response = await service.update({
        userId: 'user123',
        email: 'new@example.com',
      });

      expect(response).toEqual({
        status: true,
        message: 'User updated',
      });
    });

    it('should handle update errors', async () => {
      mockUserService.update.mockReturnValueOnce(throwError(() => new Error('Update fail')));

      await service.update({ userId: 'user123' });

      expect(handleMappedError).toHaveBeenCalledWith('UPDATE_FAILED');
    });
  });

  describe('delete()', () => {
    it('should delete user successfully', async () => {
      mockUserService.delete.mockReturnValueOnce(
        of({ status: true, message: 'User deleted' }),
      );

      const response = await service.delete({ userId: 'user123' });

      expect(response).toEqual({
        status: true,
        message: 'User deleted',
      });
    });

    it('should handle deletion errors', async () => {
      mockUserService.delete.mockReturnValueOnce(throwError(() => new Error('Delete error')));

      await service.delete({ userId: 'user123' });

      expect(handleMappedError).toHaveBeenCalledWith('DELETE_FAILED');
    });
  });
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockJwtService = {
    verify: jest.fn(),
  };
  
  describe('AuthController Unit Tests (Bug-Oriented)', () => {
    let controller: AuthController;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: JwtService, useValue: mockJwtService },
        ],
      }).compile();
  
      controller = module.get<AuthController>(AuthController);
    });
  
    afterEach(() => jest.clearAllMocks());
  
    describe('registerUser()', () => {
      it('should return success response', async () => {
        mockAuthService.register.mockResolvedValueOnce({ status: true, message: 'Registered' });
        const result = await controller.registerUser({ username: 'x', email: 'x', password: 'x', cart: [], wishlist: [] });
        expect(result).toEqual({ status: true, message: 'Registered' });
      });
  
      it('should handle registration error', async () => {
        mockAuthService.register.mockRejectedValueOnce(new Error('Registration failed'));
        await expect(controller.registerUser({ username: 'x', email: 'x', password: 'x', cart: [], wishlist: [] }))
          .resolves.toBeUndefined();
      });
    });
  
    describe('loginUser()', () => {
      it('should set cookie and return response on success', async () => {
        const mockRes = { cookie: jest.fn() } as unknown as Response;
        mockAuthService.login.mockResolvedValueOnce({
          status: true,
          message: 'Logged in',
          token: 'fake-token',
        });
  
        const result = await controller.loginUser({ email: 'a', password: 'b' }, mockRes);
        expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', 'fake-token', expect.any(Object));
        expect(result.status).toBe(true);
      });
  
      it('should not set cookie if login fails', async () => {
        const mockRes = { cookie: jest.fn() } as unknown as Response;
        mockAuthService.login.mockResolvedValueOnce({
          status: false,
          message: 'Login failed',
          token: null,
        });
  
        const result = await controller.loginUser({ email: 'a', password: 'b' }, mockRes);
        expect(mockRes.cookie).not.toHaveBeenCalled();
        expect(result.status).toBe(false);
      });
  
      it('should handle login error', async () => {
        const mockRes = { cookie: jest.fn() } as unknown as Response;
        mockAuthService.login.mockRejectedValueOnce(new Error('login crash'));
        await expect(controller.loginUser({ email: 'a', password: 'b' }, mockRes)).resolves.toBeUndefined();
      });
    });
  
    describe('checkUser()', () => {
      it('should return false if no token in cookie', async () => {
        const req = { cookies: {} } as any;
        const result = await controller.checkUser(req);
        expect(result).toEqual({ loggedIn: false });
      });
  
      it('should return true if token is valid', async () => {
        mockJwtService.verify.mockReturnValueOnce({ userId: 'x' });
        const req = { cookies: { accessToken: 'valid-token' } } as any;
        const result = await controller.checkUser(req);
        expect(result).toEqual({ loggedIn: true });
      });
  
      it('should return true even if verify throws (as per controller)', async () => {
        mockJwtService.verify.mockImplementationOnce(() => { throw new Error(); });
        const req = { cookies: { accessToken: 'bad-token' } } as any;
        const result = await controller.checkUser(req);
        expect(result).toEqual({ loggedIn: true }); // dikkat: bu default fallback
      });
    });
  
    describe('updateUser()', () => {
      it('should return update response', async () => {
        mockAuthService.update.mockResolvedValueOnce({ status: true, message: 'Updated' });
        const result = await controller.updateUser({ userId: '1', email: 'x' });
        expect(result).toEqual({ status: true, message: 'Updated' });
      });
  
      it('should handle update errors', async () => {
        mockAuthService.update.mockRejectedValueOnce(new Error('Update failed'));
        await expect(controller.updateUser({ userId: '1' })).resolves.toBeUndefined();
      });
    });
  
    describe('deleteUser()', () => {
      it('should return delete response', async () => {
        mockAuthService.delete.mockResolvedValueOnce({ status: true, message: 'Deleted' });
        const result = await controller.deleteUser('123');
        expect(result).toEqual({ status: true, message: 'Deleted' });
      });
  
      it('should handle delete errors', async () => {
        mockAuthService.delete.mockRejectedValueOnce(new Error('Delete failed'));
        await expect(controller.deleteUser('123')).resolves.toBeUndefined();
      });
    });
  });
});
