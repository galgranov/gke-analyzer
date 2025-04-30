import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/interfaces/user.interface';
import { CreateUserDto } from '../users/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usernameOrEmail: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
    
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.usernameOrEmail,
      loginDto.password,
    );
    
    const payload = { sub: user._id.toString(), username: user.username };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Convert RegisterDto to CreateUserDto
    const createUserDto: CreateUserDto = {
      ...registerDto,
      roles: ['user'],
      isActive: true,
    };
    
    try {
      const user = await this.usersService.create(createUserDto);
      
      // Remove password from response
      const { password: _, ...result } = user;
      
      // Generate JWT token
      const payload = { sub: user._id.toString(), username: user.username };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const { password: _, ...result } = user;
    return result;
  }
}
