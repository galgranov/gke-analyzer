export interface User {
  _id?: string; // Using string instead of ObjectId for client compatibility
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
