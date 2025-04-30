import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ObjectId } from 'mongodb';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b8'),
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login a user and return access token with user info', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'testuser',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          _id: mockUser._id,
          username: mockUser.username,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: mockUser.roles,
        },
      };

      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
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

      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b9'),
          username: registerDto.username,
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          roles: ['user'],
        },
      };

      jest.spyOn(service, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const userId = '5f9d88b3c7c7b2b9b8b8b8b8';
      const req = {
        user: {
          _id: userId,
        },
      };

      const expectedResult = {
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
      };

      jest.spyOn(service, 'getProfile').mockResolvedValue(expectedResult);

      const result = await controller.getProfile(req);

      expect(service.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });
});
