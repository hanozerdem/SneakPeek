import { Injectable } from "@nestjs/common";
import { DeleteUserDto, LoginUserDto, RegisterUserDto, UpdateUserDto } from "src/dtos/auth.dto";
import { DeleteResponse, GetUserByIdRequest, GetUserByIdResponse, LoginResponse, RegisterResponse, UpdateResponse, UserService } from "src/interfaces/auth.interface";
import { Client, ClientGrpc } from "@nestjs/microservices";
import { UserServiceClientOptions } from "./auth-svc.options";
import { lastValueFrom } from "rxjs";
import { handleMappedError } from "src/exceptions/error-handler";

@Injectable()
export class AuthService {
    private userService: UserService;

    @Client(UserServiceClientOptions)
    private readonly userServiceClient: ClientGrpc;

    // when the service starts we start the communication with user-service
    onModuleInit() {
        this.userService = this.userServiceClient.getService<UserService>('UserService');
        if(!this.userService) {
            console.error("Failed to connect userService");
        }
    }

    async register(user: RegisterUserDto): Promise<RegisterResponse> {
        try {
            // with lasValueFrom we use a promise
            // So wait the response than return the response
            const response = await lastValueFrom(this.userService.register({
                username: user.username,
                email: user.email,
                password: user.password,
                wishlist: user.wishlist,
                cart: user.cart
            }));

            
            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred"
            };
        } catch (err) {
            console.error(err)
            handleMappedError("REGISTER_FAILED");
        }
    }

    async login(user: LoginUserDto): Promise<LoginResponse> {
        try {

            // with lasValueFrom we use a promise
            // So wait the response than return the response
            const response = await lastValueFrom(this.userService.login({
                email: user.email,
                password: user.password
            }))

            return  {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occurred",
                token: response?.token 
            };
        }
        catch (err) {
            console.error(err)
            handleMappedError("LOGIN_FAILED");
        }
    }

    async update(user: UpdateUserDto): Promise<UpdateResponse> {
        try {

            const response = await lastValueFrom(this.userService.update({
                userId: user.userId,
                username: user?.username,
                email: user?.email,
                password: user?.password,
                wishlist: user?.wishlist,
                cart: user?.cart,
            }))

            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occured",
            };
        } catch(err) {
            console.error(err)
            handleMappedError("UPDATE_FAILED");
        }
    }

    async getUserById(userId: GetUserByIdRequest): Promise<GetUserByIdResponse> {
        try {
            const response = await lastValueFrom(this.userService.getUserById(userId))

            return response;
        } catch (err) {
            handleMappedError("GET_USER_BY_ID_FAILED");
        }
    } 

    async delete(user: DeleteUserDto): Promise<DeleteResponse> {
        try {

            const response = await lastValueFrom(this.userService.delete({
                userId: user.userId
            }))

            return {
                status: response?.status ?? false,
                message: response?.message ?? "Unknown error occured",
            };
        } catch(err) {
            console.error(err)
            handleMappedError("DELETE_FAILED");
        }
    }
}
