import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Create a mock for the AuthGuard parent class
jest.mock('@nestjs/passport', () => {
  class MockAuthGuard {
    canActivate() {
      return true;
    }
  }
  
  return {
    AuthGuard: jest.fn(() => MockAuthGuard),
  };
});

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
        getType: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      };
    });

    it('should allow access to public routes', () => {
      // Mock reflector to return true for IS_PUBLIC_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should use JWT authentication for non-public routes', () => {
      // Mock reflector to return false for IS_PUBLIC_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      // Spy on the prototype's canActivate method
      const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
      
      const result = guard.canActivate(mockExecutionContext);
      
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return the user if no error and user exists', () => {
      const mockUser = { id: '1', username: 'testuser' };
      const result = guard.handleRequest(null, mockUser, null);
      expect(result).toEqual(mockUser);
    });

    it('should throw the error if an error exists', () => {
      const mockError = new Error('Test error');
      expect(() => guard.handleRequest(mockError, null, null)).toThrow(mockError);
    });

    it('should throw UnauthorizedException if no error but also no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(null, null, null)).toThrow('Authentication required');
    });
  });
});
