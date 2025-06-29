import { DeleteUserDto, LoginUserDto, RegisterUserDto, UpdateUserDto } from "src/dtos/auth.dto";
import { DeleteResponse, LoginResponse, RegisterResponse, UpdateResponse } from "src/interfaces/auth.interface";
export declare class AuthService {
    private userService;
    private readonly userServiceClient;
    onModuleInit(): void;
    register(user: RegisterUserDto): Promise<RegisterResponse>;
    login(user: LoginUserDto): Promise<LoginResponse>;
    update(user: UpdateUserDto): Promise<UpdateResponse>;
    delete(user: DeleteUserDto): Promise<DeleteResponse>;
}
