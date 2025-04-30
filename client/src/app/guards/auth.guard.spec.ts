import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    const authServiceSpy = {
      isLoggedIn: jest.fn()
    };
    const routerSpy = {
      createUrlTree: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(true);
    
    const result = guard.canActivate();
    
    expect(result).toBe(true);
    expect(authService.isLoggedIn).toHaveBeenCalled();
  });

  it('should redirect to login page when user is not logged in', () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(false);
    const mockUrlTree = {} as UrlTree;
    (router.createUrlTree as jest.Mock).mockReturnValue(mockUrlTree);
    
    const result = guard.canActivate();
    
    expect(result).toBe(mockUrlTree);
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
