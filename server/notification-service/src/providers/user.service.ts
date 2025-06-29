import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UserService {
  /**
   * Fetches the full user information by userId.
   */
  async getUserById(userId: string): Promise<{ username: string; email: string }> {
    try {
      const response = await axios.get<{ user: { username: string; email: string } }>(
        `http://api-gateway:9000/api/auth/user/${userId}`
      );

      if (!response.data || !response.data.user) {
        console.error(`❌ No user data found for userId=${userId}`);
        throw new Error('User data missing');
      }

      return response.data.user;
    } catch (error: any) {
      console.error(`❌ Failed to fetch user by userId=${userId}:`, error.message);
      throw new Error('Failed to retrieve user information');
    }
  }

  /**
   * Fetches only the email address of the user by userId.
   */
  async getUserEmail(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    return user.email;
  }
}