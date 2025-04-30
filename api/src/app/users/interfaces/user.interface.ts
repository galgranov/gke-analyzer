import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
