import { Injectable, NotFoundException, Inject, ConflictException } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './interfaces/user.interface';
import { DATABASE_CONNECTION } from '../database/database.providers';

export const USERS_COLLECTION = 'users';

@Injectable()
export class UsersService {
  private readonly usersCollection: Collection<User>;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Db
  ) {
    this.usersCollection = this.db.collection<User>(USERS_COLLECTION);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.usersCollection.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const now = new Date();
    const userToInsert = {
      ...createUserDto,
      password: hashedPassword,
      roles: createUserDto.roles || ['user'],
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await this.usersCollection.insertOne(userToInsert as any);
    return { ...userToInsert, _id: result.insertedId };
  }

  async findAll(): Promise<User[]> {
    return this.usersCollection.find().toArray();
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`User with ID ${id} not found or invalid ID format`);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersCollection.findOne({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersCollection.findOne({ email });
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.usersCollection.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updateData: any = { ...updateUserDto, updatedAt: new Date() };
      
      // If password is provided, hash it
      if (updateUserDto.password) {
        updateData.password = await this.hashPassword(updateUserDto.password);
      }

      // Check if username or email already exists (if they are being updated)
      if (updateUserDto.username || updateUserDto.email) {
        const existingUser = await this.usersCollection.findOne({
          _id: { $ne: new ObjectId(id) },
          $or: [
            ...(updateUserDto.username ? [{ username: updateUserDto.username }] : []),
            ...(updateUserDto.email ? [{ email: updateUserDto.email }] : [])
          ]
        });

        if (existingUser) {
          if (updateUserDto.username && existingUser.username === updateUserDto.username) {
            throw new ConflictException('Username already exists');
          }
          if (updateUserDto.email && existingUser.email === updateUserDto.email) {
            throw new ConflictException('Email already exists');
          }
        }
      }

      const result = await this.usersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`User with ID ${id} not found or invalid ID format`);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const result = await this.usersCollection.findOneAndDelete({ _id: new ObjectId(id) });
      
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`User with ID ${id} not found or invalid ID format`);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
