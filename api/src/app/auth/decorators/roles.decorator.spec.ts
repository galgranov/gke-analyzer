import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, Roles } from './roles.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with the correct parameters', () => {
    // Arrange
    const roles = ['admin', 'user'];
    
    // Act
    Roles(...roles);
    
    // Assert
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });
});
