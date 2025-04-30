import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with username/email and password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns JWT token and user information',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'Returns JWT token and user information',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - Username or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current user profile',
    schema: {
      properties: {
        _id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user._id);
  }
}
