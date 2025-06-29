import { DeleteResponse, GetUserByIdResponse, LoginResponse, RegisterResponse, UpdateResponse, UserDelete, UserLogin, UserRegister, UserUpdate } from './../interfaces/user.interface';
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../models/user.model";
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {
    constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    ) {}


    
    async register(user: UserRegister): Promise<RegisterResponse>{
        try {
            // If there is a user already have the same email
            // return an error
            const existingUser = await this.userModel.findOne({
                $or: [{ email: user.email }, { username: user.username }]
            });            
            // Create a predefined response
            let response: RegisterResponse = {status: false, message: 'Unknown error!'}

            if (existingUser) {
                if (existingUser.email === user.email) {
                    response.message = 'Email already exists!';
                } else if (existingUser.username === user.username) {
                    response.message = 'Username already exists!';
                }
                return response;
            }

            const hashedPassword = bcrypt.hashSync(user.password,10);

            // predefined role is customer
            const newUser = new this.userModel({
                username: user.username,
                email: user.email,
                password: hashedPassword,
                role: 'customer',
                wishlist: user.wishlist,
                cart: user.cart
            });
    
            await newUser.save();
            
            response.status = true;
            response.message = `User ${user.username} registered successfully!`;
            return response;

        } catch (error) {
            console.error('ERROR in UserService.register:', error);
            let response: RegisterResponse = {status: false, message: 'Register user error!'}
           
            // Error for grpc.
            return response;
        }
    }

    async login(userRequest: UserLogin): Promise<LoginResponse>{
        try {
            const user = await this.userModel.findOne({email: userRequest.email});
            let response: LoginResponse = {status: false, message: 'Unknown error!'};

            if (!user || !(await bcrypt.compare(userRequest.password, user.password))) {
                response.message = 'Invalid credentials';
                return response;
            }

            // Sign the token with id and user role
            const payload = { id: user._id, role: user.role};
            const token = this.jwtService.sign(payload, { expiresIn: '1h' });

            response.status = true;
            response.message = 'Login successful';
            response.token = token;

            return response;
        } catch(err) {
            console.error('ERROR in UserService.login:', err);
            let response: LoginResponse = {status: false, message: 'Login user error'}
           
            // Error for grpc.
            return response;
        }
    }

    async update(userRequest: UserUpdate): Promise<UpdateResponse> {
        try {
            const user = await this.userModel.findById(userRequest.userId);
            let response: UpdateResponse = {status: false, message: 'Unknown error!'};
            if(!user) {
                response.message = 'User not found!';
                return response;
            }
    
            if (userRequest.password) {
                user.password = await bcrypt.hash(userRequest.password, 10);
            }
            
            if (userRequest.username) user.username = userRequest.username;
            if (userRequest.email) user.email = userRequest.email;
            if (userRequest.wishlist) user.wishlist = userRequest.wishlist;
            if (userRequest.cart) user.cart = userRequest.cart;

            await user.save();
    
            response.status = true;
            response.message = 'User updated successfully!';
            return response;
        }catch(err) {
            console.error('ERROR in UserService.update:', err);
            let response: UpdateResponse = {status: false, message: 'Update user error!'}
           
            // Error for grpc.
            return response;
        }
    }

    async delete(userRequest: UserDelete): Promise<DeleteResponse> {
        try {
            const user = await this.userModel.findById(userRequest.userId);
            let response: DeleteResponse = {status: false, message: 'Unknown error!'};
            if(!user) {
                response.message = 'User not found!';
                return response;
            }

            await this.userModel.findByIdAndDelete(userRequest.userId)
            
            response.status = true;
            response.message = 'User deleted successfully!';

            return response;
        } catch(err) {
            console.error('ERROR in UserService.delete: ', err);
            let response: DeleteResponse = {status: false, message: 'Delete user error!'}
           
            // Error for grpc.
            return response;
        }
    }

    async getUserById(userId: string): Promise<GetUserByIdResponse> {
        try {
          const user = await this.userModel.findById(userId);
    
          if (!user || !user._id) {
            return {
              status: false,
              message: 'User not found',
            };
          }
    
          return {
            status: true,
            message: 'User retrieved successfully',
            user: {
              userId: user._id.toString(),
              username: user.username,
              email: user.email,
              address: '',
              wishlist: user.wishlist || [],
              cart: user.cart || [],
            },
          };
        } catch (err) {
          console.error('ERROR in UserService.getUserById:', err);
          return {
            status: false,
            message: 'Internal server error',
          };
        }
      }
}