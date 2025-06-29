// Register Messages
// Communication between user register function with gRPC
export interface UserRegister {
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





// Login Messages
// Communication between user login function with gRPC
export interface UserLogin {
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




// Update Messages
// Communication between user update function with gRPC

export interface UserUpdate {
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



// Delete Messages
// Communication between user delete function with gRPC

export interface UserDelete {
    userId: string;
}


// Communication between user delete function with gRPC 
// but this is response from user-service

export interface DeleteResponse {
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
  