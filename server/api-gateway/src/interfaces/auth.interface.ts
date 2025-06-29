import { Observable } from "rxjs";

// General Auth System Interfaces (Register and Login)

// Communication between user register function with gRPC
export interface RegisterBody {
  username: string;
  email: string;
  password: string;
  wishlist: number[];
  cart: number[];
}

// Communication between user register function with gRPC 
// but this is response from user-service
export interface RegisterResponse {
  status: boolean;
  message: string;
}

// Communication between user login function with gRPC
export interface LoginBody {
  email: string;
  password: string;
}

// Communication between user login function with gRPC 
// but this is response from user-service
export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
}

// Communication between user update function with gRPC
export interface UpdateBody {
  userId: string;
  username?: string;
  email?: string;
  password?: string;
  wishlist?: number[];
  cart?: number[];
}

// Communication between user update function with gRPC 
// but this is response from user-service
export interface UpdateResponse {
  status: boolean;
  message: string;
}

// Communication between user delete function with gRPC
export interface DeleteBody {
  userId: string;
}

// Communication between user delete function with gRPC 
// but this is response from user-service
export interface DeleteResponse {
  status: boolean;
  message: string;
}

// Communication between user logout function with gRPC
export interface LogoutBody {
  /** Optional user identifier or session ID if required */
  userId?: string;
}

// Communication between user logout function with gRPC
export interface LogoutResponse {
  status: boolean;
  message: string;
}

// This is for get User By Id messages

export interface GetUserByIdRequest {
  userId: string;
}

export interface GetUserByIdResponse {
  status: boolean;
  message: string;
  user?: {
    userId: string;
    email: string;
    username: string;
    address: string;
    wishlist: number[];
    cart: number[];
  };
}


// gRPC service method definitions
export interface UserService {
  register(data: RegisterBody): Observable<RegisterResponse>;
  login(data: LoginBody): Observable<LoginResponse>;
  update(data: UpdateBody): Observable<UpdateResponse>;
  delete(data: DeleteBody): Observable<DeleteResponse>;

  /**
   * Logout the current user (invalidate session/token)
   */
  logout(data: LogoutBody): Observable<LogoutResponse>;

  getUserById(data: GetUserByIdRequest): Observable<GetUserByIdResponse>;
}
