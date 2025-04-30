import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: any) {
    // Special case for test tokens (only in development mode)
    if (this.configService.isDevelopment && payload.isTestToken) {
      return {
        _id: payload.sub,
        username: payload.username,
        email: 'test@example.com',
        roles: ['user', 'admin'], // Include admin role for testing all endpoints
        firstName: 'Test',
        lastName: 'User',
        isActive: true
      };
    }
    
    // Normal validation for real tokens
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
    
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
