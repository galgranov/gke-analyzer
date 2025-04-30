import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b8'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
  };

  const mockUsersService = {
    findByUsernameOrEmail: jest.fn(),
    validatePassword: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(mockUsersService.findByUsernameOrEmail).toHaveBeenCalledWith('testuser');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith('password123', mockUser.password);
      
      // Should return user without password
      const { password, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent', 'password123')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUsersService.findByUsernameOrEmail).toHaveBeenCalledWith('nonexistent');
      expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.validateUser('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUsersService.findByUsernameOrEmail).toHaveBeenCalledWith('testuser');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.findByUsernameOrEmail.mockResolvedValue(inactiveUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      await expect(service.validateUser('testuser', 'password123')).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUsersService.findByUsernameOrEmail).toHaveBeenCalledWith('testuser');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith('password123', inactiveUser.password);
    });
  });

  describe('login', () => {
    it('should login a user and return access token with user info', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'testuser',
        password: 'password123',
      };

      const { password, ...userWithoutPassword } = mockUser;
      
      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.usernameOrEmail,
        loginDto.password
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id.toString(),
        username: mockUser.username,
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          _id: mockUser._id,
          username: mockUser.username,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: mockUser.roles,
        },
      });
    });
  });

  describe('register', () => {
    it('should register a new user and return access token with user info', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const newUser = {
        _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b9'),
        ...registerDto,
        roles: ['user'],
        isActive: true,
        password: 'hashedPassword',
      };

      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        roles: ['user'],
        isActive: true,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: newUser._id.toString(),
        username: newUser.username,
      });
      
      const { password, ...userWithoutPassword } = newUser;
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: userWithoutPassword,
      });
    });

    it('should rethrow ConflictException if users service throws it', async () => {
      const registerDto: RegisterDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUsersService.create.mockRejectedValue(new ConflictException('Username already exists'));

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        roles: ['user'],
        isActive: true,
      });
    });

    it('should throw UnauthorizedException for other errors', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockUsersService.create.mockRejectedValue(new Error('Database error'));

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        roles: ['user'],
        isActive: true,
      });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile without password', async () => {
      const userId = '5f9d88b3c7c7b2b9b8b8b8b8';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(userId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      
      const { password, ...userWithoutPassword } = mockUser;
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const userId = '5f9d88b3c7c7b2b9b8b8b8b8';
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
