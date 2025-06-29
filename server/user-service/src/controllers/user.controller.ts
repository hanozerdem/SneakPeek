import { Controller, OnModuleInit } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GetUserByIdRequest, GetUserByIdResponse, LoginResponse, RegisterResponse, UpdateResponse, UserLogin, UserRegister, UserUpdate } from "src/interfaces/user.interface";
import { UserService } from "src/providers/user.service";

@Controller()
export class UserController implements OnModuleInit {
  constructor(private readonly userService: UserService) {}
  // This function runs when service starts
  onModuleInit() {
    console.log('UserService gRPC start!');
  }

  @GrpcMethod('UserService', 'Register')
    async register(user: UserRegister): Promise<RegisterResponse> {
      if (!user.username?.trim() || !user.email?.trim() || !user.password?.trim()) {
          console.error('ERROR: Missing parameters!', user);
          return { status: false, message: 'Missing required parameters! (username, email, password)' };
      }

      return this.userService.register(user);
  }
  

  @GrpcMethod('UserService', 'Login')
    async login(user: UserLogin): Promise<LoginResponse> {
      if (!user.email?.trim() || !user.password?.trim()) {
        console.error('ERROR: Missing parameters!', user);
        return { status: false, message: 'Missing required parameters! (email, password)'};
    }

    return this.userService.login(user);
  }

  @GrpcMethod('UserService', 'Update')
  async update(user: UserUpdate): Promise<UpdateResponse> {
    if(!user.userId){
      console.error('Error: Miising user id');
      return { status: false, message: 'Missing required parameters (userId)'};
    }

    return this.userService.update(user);
  }

  @GrpcMethod('UserService', 'Delete')
  async delete(user: UserUpdate): Promise<UpdateResponse> {
    if(!user.userId){
      console.error('Error: Miising user id');
      return { status: false, message: 'Missing required parameters (userId)'};
    }

    return this.userService.delete(user);
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    if (!data.userId?.trim()) {
      return {
        status: false,
        message: 'Missing userId',
      };
    }

    return this.userService.getUserById(data.userId);
  }
}
