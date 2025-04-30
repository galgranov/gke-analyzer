import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, USERS_COLLECTION } from './users.service';
import { DATABASE_CONNECTION } from '../database/database.providers';
import { ObjectId, Collection, Db } from 'mongodb';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersCollection: jest.Mocked<Collection<User>>;
  let db: Partial<Db>;

  const mockUser: User = {
    _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b8'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock for MongoDB collection
    usersCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      toArray: jest.fn(),
    } as unknown as jest.Mocked<Collection<User>>;

    // Mock the find().toArray() chain
    (usersCollection.find as jest.Mock).mockReturnValue({
      toArray: jest.fn().mockResolvedValue([mockUser]),
    });

    // Create mock for MongoDB database
    db = {
      collection: jest.fn().mockReturnValue(usersCollection),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DATABASE_CONNECTION,
          useValue: db,
        },
        {
          provide: USERS_COLLECTION,
          useValue: 'users',
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        roles: ['user'],
        isActive: true,
      };

      usersCollection.findOne.mockResolvedValue(null);
      const insertedId = new ObjectId('5f9d88b3c7c7b2b9b8b8b8b9');
      (usersCollection.insertOne as jest.Mock).mockResolvedValue({
        insertedId,
      });

      const result = await service.create(createUserDto);

      expect(usersCollection.findOne).toHaveBeenCalledWith({
        $or: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
      expect(usersCollection.insertOne).toHaveBeenCalled();
      expect(result).toHaveProperty('_id', insertedId);
      expect(result).toHaveProperty('username', createUserDto.username);
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result).toHaveProperty('password', 'hashedPassword');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should create a user with default roles and isActive if not provided', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      usersCollection.findOne.mockResolvedValue(null);
      const insertedId = new ObjectId('5f9d88b3c7c7b2b9b8b8b8b9');
      (usersCollection.insertOne as jest.Mock).mockResolvedValue({
        insertedId,
      });

      const result = await service.create(createUserDto);

      expect(usersCollection.insertOne).toHaveBeenCalled();
      expect(result).toHaveProperty('roles', ['user']);
      expect(result).toHaveProperty('isActive', true);
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      usersCollection.findOne.mockResolvedValue({
        ...mockUser,
        username: 'existinguser',
        email: 'existing@example.com',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(usersCollection.findOne).toHaveBeenCalled();
      expect(usersCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      usersCollection.findOne.mockResolvedValue({
        ...mockUser,
        username: 'existinguser',
        email: 'existing@example.com',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(usersCollection.findOne).toHaveBeenCalled();
      expect(usersCollection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();

      expect(usersCollection.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      usersCollection.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(id);

      expect(usersCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      usersCollection.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(usersCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should throw NotFoundException if id format is invalid', async () => {
      const id = 'invalid-id';

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(usersCollection.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const username = 'testuser';
      usersCollection.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername(username);

      expect(usersCollection.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      const username = 'nonexistent';
      usersCollection.findOne.mockResolvedValue(null);

      const result = await service.findByUsername(username);

      expect(usersCollection.findOne).toHaveBeenCalledWith({ username });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      usersCollection.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(usersCollection.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      const email = 'nonexistent@example.com';
      usersCollection.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(usersCollection.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('should return a user by username or email', async () => {
      const usernameOrEmail = 'testuser';
      usersCollection.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsernameOrEmail(usernameOrEmail);

      expect(usersCollection.findOne).toHaveBeenCalledWith({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      const usernameOrEmail = 'nonexistent';
      usersCollection.findOne.mockResolvedValue(null);

      const result = await service.findByUsernameOrEmail(usernameOrEmail);

      expect(usersCollection.findOne).toHaveBeenCalledWith({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
      };

      const updatedUser = { ...mockUser, ...updateUserDto, updatedAt: expect.any(Date) };
      usersCollection.findOneAndUpdate.mockResolvedValue(updatedUser as any);

      const result = await service.update(id, updateUserDto);

      expect(usersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        {
          $set: {
            ...updateUserDto,
            updatedAt: expect.any(Date),
          },
        },
        { returnDocument: 'after' }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should hash password if provided in update', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword',
      };

      const updatedUser = { ...mockUser, password: 'hashedPassword', updatedAt: expect.any(Date) };
      usersCollection.findOneAndUpdate.mockResolvedValue(updatedUser as any);

      const result = await service.update(id, updateUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 'salt');
      expect(usersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        {
          $set: {
            password: 'hashedPassword',
            updatedAt: expect.any(Date),
          },
        },
        { returnDocument: 'after' }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if username already exists', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser',
      };

      usersCollection.findOne.mockResolvedValue({
        ...mockUser,
        _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b9'), // Different ID
        username: 'existinguser',
      });

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(usersCollection.findOne).toHaveBeenCalled();
      expect(usersCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      usersCollection.findOne.mockResolvedValue({
        ...mockUser,
        _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b9'), // Different ID
        email: 'existing@example.com',
      });

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(usersCollection.findOne).toHaveBeenCalled();
      expect(usersCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      usersCollection.findOneAndUpdate.mockResolvedValue(null);

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException
      );
      expect(usersCollection.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if id format is invalid', async () => {
      const id = 'invalid-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException
      );
      expect(usersCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      usersCollection.findOneAndDelete.mockResolvedValue(mockUser as any);

      const result = await service.remove(id);

      expect(usersCollection.findOneAndDelete).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      usersCollection.findOneAndDelete.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(usersCollection.findOneAndDelete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if id format is invalid', async () => {
      const id = 'invalid-id';

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(usersCollection.findOneAndDelete).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true if password is valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('password', 'hashedPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should return false if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrongpassword', 'hashedPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(result).toBe(false);
    });
  });
});
