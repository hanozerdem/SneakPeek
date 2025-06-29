import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import {
  DeleteUserDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
} from 'src/dtos/auth.dto';
import { handleError } from 'src/exceptions/error-handler';
import { AuthExceptionFilter } from 'src/common/filters/auth-exception.filter';
import {
  DeleteResponse,
  GetUserByIdRequest,
  GetUserByIdResponse,
  LoginResponse,
  RegisterResponse,
  UpdateResponse,
} from 'src/interfaces/auth.interface';

import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

// api/auth
// login and register update delete methods
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // Check that has user any token in cookies
  @Get('/check')
  async checkUser(@Req() req: Request): Promise<{ loggedIn: boolean }> {
    try {
      const token = req.cookies ? req.cookies['accessToken'] : null;
      if (!token) {
        return { loggedIn: false };
      }
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      if (!decoded) {
        return { loggedIn: false };
      }
      return { loggedIn: true };
    } catch (err) {
      return { loggedIn: false };
    }
  }

  // api/auth/register
  @Post('/register')
  @UseFilters(AuthExceptionFilter)
  async registerUser(@Body() user: RegisterUserDto): Promise<RegisterResponse> {
    try {
      return await this.authService.register(user);
    } catch (err) {
      handleError(err);
    }
  }

  // api/auth/login
  @Post('login')
  @UseFilters(AuthExceptionFilter)
  async loginUser(
    @Body() user: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    try {
      const loginResponse = await this.authService.login(user);
      if (loginResponse.status && loginResponse.token) {
        res.cookie('accessToken', loginResponse.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 10000,
          sameSite: 'lax',
          path: '/',
        });
      }
      return loginResponse;
    } catch (err) {
      handleError(err);
    }
  }

  // api/auth/logout
  @Post('logout')
  @UseFilters(AuthExceptionFilter)
  async logoutUser(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ status: boolean; message: string }> {
    try {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return { status: true, message: 'Logged out successfully' };
    } catch (err) {
      handleError(err);
    }
  }
/*
  @Get('/user/:id')
  async getUserById(@Param('id') userId: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    try {
      const user = await this.authService.getUserById(userId);
      return user;
    } catch (err) {
      handleError(err);
    }
  }
*/
@Get('/user/:id')
async getUserById(@Param('id') id: string): Promise<GetUserByIdResponse> {
  try {
    const request: GetUserByIdRequest = { userId: id };
    const user = await this.authService.getUserById(request);
    return user;
  } catch (err) {
    handleError(err);
  }
}
  
  // /api/auth/update
  @Post('update')
  @UseFilters(AuthExceptionFilter)
  async updateUser(@Body() user: UpdateUserDto): Promise<UpdateResponse> {
    try {
      return await this.authService.update(user);
    } catch (err) {
      handleError(err);
    }
  }

  // /api/auth/delete
  @Post('delete/:id')
  @UseFilters(AuthExceptionFilter)
  async deleteUser(@Param('id') userId: string): Promise<DeleteResponse> {
    try {
      const deleteUser: DeleteUserDto = { userId };
      return await this.authService.delete(deleteUser);
    } catch (err) {
      handleError(err);
    }
  }
}
